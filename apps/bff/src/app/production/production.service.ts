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
  BrokerException,
  BrokerQueues,
  CreateProductionEntity,
  IntervallMappingResult,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  SubmitProductionProps,
  UnitFileBundle,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import {
  CreateProductionDto,
  IntervallMappingResultDto,
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
    if (
      !powerProductionFiles ||
      powerProductionFiles.length === 0 ||
      !hydrogenProductionFiles ||
      hydrogenProductionFiles.length === 0
    )
      throw new BadRequestException(
        'At least one file for power production and one file for hydrogen production is required.',
      );

    if (
      dto.hydrogenProductionUnitIds.length < hydrogenProductionFiles.length ||
      dto.powerProductionUnitIds.length < powerProductionFiles.length
    )
      throw new BadRequestException(`Missing related  unit for at least one file.`);

    const h2ProductionData: UnitFileBundle[] = this.mapToImportedFileBundles(
      dto.hydrogenProductionUnitIds,
      hydrogenProductionFiles,
    );

    const powerProductionData: UnitFileBundle[] = this.mapToImportedFileBundles(
      dto.powerProductionUnitIds,
      powerProductionFiles,
    );

    const processedFiles = await this.csvParser.processFiles(powerProductionData, h2ProductionData);

    if (
      processedFiles.hydrogenProduction.some((bundle) => bundle.data.length < 1) ||
      processedFiles.powerProduction.some((bundle) => bundle.data.length < 1)
    )
      throw new BrokerException('All files need to contain at least one valid item.', HttpStatus.BAD_REQUEST);

    const payload = { data: processedFiles, userId: userId };
    const matchingResult = await firstValueFrom(
      this.processSvc.send<IntervallMappingResult>(ProductionMessagePatterns.PERIOD_MATCHING, payload),
    );

    return new IntervallMappingResultDto(matchingResult);
  }

  submitCsvdata(id: string, hydrogenStorageUnitId: string, userId: string) {
    const payload: SubmitProductionProps = new SubmitProductionProps(userId, hydrogenStorageUnitId, id);
    return firstValueFrom(this.processSvc.send(ProductionMessagePatterns.IMPORT, payload));
  }

  private mapToImportedFileBundles(unitIds: string | string[], files: Express.Multer.File[]): UnitFileBundle[] {
    const data: UnitFileBundle[] = [];

    if (Array.isArray(unitIds)) {
      for (let i = 0; i < files.length; i++) {
        const bundle = new UnitFileBundle(unitIds[i], files[i]);
        data.push(bundle);
      }
    } else {
      data.push(new UnitFileBundle(unitIds, files[0]));
    }

    return data;
  }
}
