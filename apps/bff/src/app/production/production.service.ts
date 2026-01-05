/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvParserService } from 'libs/csv-parser/src/lib/csv-parser.service';
import { firstValueFrom } from 'rxjs';
import { BadRequestException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  BrokerQueues,
  CreateProductionsPayload,
  FinalizeStagedProductionsPayload,
  ParsedFileBundles,
  ParsedProductionMatchingResultEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  ReadProcessStepsPayload,
  StageProductionsPayload,
  UnitDataBundle,
  UnitFileBundle,
} from '@h2-trust/amqp';
import {
  AccountingPeriodMatchingResultDto,
  CreateProductionDto,
  ImportSubmissionDto,
  ProductionCSVUploadDto,
  ProductionOverviewDto,
  UserDetailsDto,
} from '@h2-trust/api';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  private readonly headersMap: Record<'power' | 'hydrogen', string[]> = {
    power: ['time', 'amount'],
    hydrogen: ['time', 'amount', 'power'],
  };

  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
    private readonly csvParser: CsvParserService,
  ) { }

  async createProductions(dto: CreateProductionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const payload: CreateProductionsPayload = CreateProductionsPayload.of(
      dto.productionStartedAt,
      dto.productionEndedAt,
      dto.powerProductionUnitId,
      dto.powerAmountKwh,
      dto.hydrogenProductionUnitId,
      dto.hydrogenAmountKg,
      userId,
      dto.hydrogenStorageUnitId
    );

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, payload),
    );

    return processSteps
      .filter((step) => step.type === ProcessType.HYDROGEN_PRODUCTION)
      .map(ProductionOverviewDto.fromEntity);
  }

  async readHydrogenProductionsByCompany(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetailsDto: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const companyIdOfUser = userDetailsDto.company.id;
    const payload: ReadProcessStepsPayload = ReadProcessStepsPayload.of(
      undefined,
      [ProcessType.POWER_PRODUCTION],
      undefined,
      companyIdOfUser,
    );

    return firstValueFrom(this.batchSvc.send(ProcessStepMessagePatterns.READ_ALL, payload)).then((processSteps) =>
      processSteps.map(ProductionOverviewDto.fromEntity),
    );
  }

  async importCSV(
    powerProductionFiles: Express.Multer.File[],
    hydrogenProductionFiles: Express.Multer.File[],
    dto: ProductionCSVUploadDto,
    userId: string,
  ) {
    const powerProduction = await this.processFile<AccountingPeriodPower>(
      powerProductionFiles,
      dto.powerProductionUnitIds,
      'power',
    );

    const hydrogenProduction = await this.processFile<AccountingPeriodHydrogen>(
      hydrogenProductionFiles,
      dto.hydrogenProductionUnitIds,
      'hydrogen',
    );

    const parsedFileBundles = new ParsedFileBundles(powerProduction, hydrogenProduction);
    const payload = StageProductionsPayload.of(parsedFileBundles, userId);
    const matchingResult = await firstValueFrom(
      this.processSvc.send<ParsedProductionMatchingResultEntity>(ProductionMessagePatterns.STAGE, payload),
    );

    return AccountingPeriodMatchingResultDto.fromEntity(matchingResult);
  }

  async submitCsvData(dto: ImportSubmissionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const payload: FinalizeStagedProductionsPayload = FinalizeStagedProductionsPayload.of(userId, dto.storageUnitId, dto.importId);
    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send<ProcessStepEntity[]>(ProductionMessagePatterns.FINALIZE, payload),
    );

    return processSteps.map(ProductionOverviewDto.fromEntity);
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
    type: 'hydrogen' | 'power',
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(`Missing file for ${type} production.`);
    }

    if (unitIds.length < files.length) {
      throw new BadRequestException(`Missing related unit for ${type} production.`);
    }

    const productionData: UnitFileBundle[] = this.mapToImportedFileBundles(unitIds, files);

    const headers = this.headersMap[type];

    const parsedFiles = await Promise.all(
      productionData.map(async (bundle) => {
        const parsedFile: T[] = await this.csvParser.parseFile<T>(bundle.file, headers);
        return new UnitDataBundle<T>(bundle.unitId, parsedFile);
      }),
    );

    if (parsedFiles.some((bundle) => bundle.data.length < 1)) {
      throw new BrokerException(` ${type} production file does not contain any valid items.`, HttpStatus.BAD_REQUEST);
    }

    return parsedFiles;
  }
}
