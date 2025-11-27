/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvParserService } from 'libs/csv-parser/src/lib/csv-parser.service';
import { firstValueFrom } from 'rxjs';
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  IntervallMatchingResultEntity,
  ParsedFileBundles,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  SubmitProductionProps,
  UnitDataBundle,
  UnitFileBundle,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {
  CreateProductionDto,
  ImportSubmissionDto,
  IntervallMatchingResultDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalService: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
    private readonly csvParser: CsvParserService,
  ) {}

  async createProduction(dto: CreateProductionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const hydrogenColor = await this.fetchHydrogenColor(dto.powerProductionUnitId);
    const companyIdOfPowerProductionUnit = await this.fetchCompanyOfProductionUnit(dto.powerProductionUnitId);
    const companyIdOfHydrogenProductionUnit = await this.fetchCompanyOfProductionUnit(dto.hydrogenProductionUnitId);

    const createProductionEntity = CreateProductionEntity.of(
      dto,
      userId,
      hydrogenColor,
      companyIdOfPowerProductionUnit,
      companyIdOfHydrogenProductionUnit,
    );

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, { createProductionEntity }),
    );

    return processSteps
      .filter((step) => step.type === ProcessType.HYDROGEN_PRODUCTION)
      .map(ProductionOverviewDto.fromEntity);
  }

  private async fetchHydrogenColor(powerProductionUnitId: string): Promise<string> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: powerProductionUnitId }),
    );

    const hydrogenColor = powerProductionUnit?.type?.hydrogenColor;

    if (!hydrogenColor) {
      throw new HttpException(
        `Power Production Unit ${powerProductionUnitId} has no Hydrogen Color`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return hydrogenColor;
  }

  private async fetchCompanyOfProductionUnit(productionUnitId: string): Promise<string> {
    const productionUnitEntity: PowerProductionUnitEntity = await firstValueFrom(
      this.generalService.send(UnitMessagePatterns.READ, { id: productionUnitId }),
    );

    if (!productionUnitEntity.company) {
      throw new BrokerException(
        `Production Unit ${productionUnitId} does not have an associated company`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return productionUnitEntity.company.id;
  }

  async readHydrogenProductionsByCompany(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const companyIdOfUser = userDetailsDto.company.id;
    const payload = {
      predecessorProcessTypes: [ProcessType.POWER_PRODUCTION],
      companyId: companyIdOfUser,
    };

    return firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_ALL, payload)).then((processSteps) =>
      processSteps.map(ProductionOverviewDto.fromEntity),
    );
  }

  async importCSV(
    powerProductionFiles: Express.Multer.File[],
    hydrogenProductionFiles: Express.Multer.File[],
    dto: ProductionCSVUploadDto,
    userId: string,
  ) {
    const h2 = await this.processFile<AccountingPeriodHydrogen>(
      hydrogenProductionFiles,
      dto.hydrogenProductionUnitIds,
      'hydrogen',
    );

    const power = await this.processFile<AccountingPeriodPower>(
      powerProductionFiles,
      dto.powerProductionUnitIds,
      'power',
    );

    const processedFiles: ParsedFileBundles = { hydrogenProduction: h2, powerProduction: power };

    const payload = { data: processedFiles, userId: userId };
    const matchingResult = await firstValueFrom(
      this.processSvc.send<IntervallMatchingResultEntity>(ProductionMessagePatterns.PERIOD_MATCHING, payload),
    );

    return new IntervallMatchingResultDto(matchingResult);
  }

  submitCsvData(dto: ImportSubmissionDto, userId: string) {
    const payload: SubmitProductionProps = new SubmitProductionProps(userId, dto.storageUnitId, dto.intervallSetId);
    return firstValueFrom(this.processSvc.send(ProductionMessagePatterns.IMPORT, payload));
  }

  private mapToImportedFileBundles(unitIds: string | string[], files: Express.Multer.File[]): UnitFileBundle[] {
    return Array.isArray(unitIds)
      ? files.map((file, i) => new UnitFileBundle(unitIds[i], file))
      : files.length
        ? [new UnitFileBundle(unitIds, files[0])]
        : [];
  }

  private async processFile<T extends AccountingPeriodHydrogen | AccountingPeriodPower>(
    files: Express.Multer.File[],
    unitIds: string | string[],
    kind: 'power' | 'hydrogen',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Missing file for hydrogen production.');
    }

    if (unitIds.length < files.length) {
      throw new BadRequestException(`Missing related unit for power production.`);
    }

    const h2ProductionData: UnitFileBundle[] = this.mapToImportedFileBundles(unitIds, files);

    const headers = this.getValidHeaders(kind);

    const parsedPowerFiles = await Promise.all(
      h2ProductionData.map(async (bundle) => {
        const parsedFile: T[] = await this.csvParser.parse<T>(bundle.file, headers);
        return new UnitDataBundle<T>(bundle.unitId, parsedFile);
      }),
    );

    if (parsedPowerFiles.some((bundle) => bundle.data.length < 1)) {
      throw new BrokerException('Hydrogen production file does not contain any valid items.', HttpStatus.BAD_REQUEST);
    }

    return parsedPowerFiles;
  }

  private getValidHeaders(kind: 'power' | 'hydrogen'): string[] {
    const map = new Map<'power' | 'hydrogen', string[]>([
      ['power', ['time', 'amount']],
      ['hydrogen', ['time', 'amount', 'power']],
    ]);

    return map.get(kind);
  }
}
