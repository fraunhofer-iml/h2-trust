/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  CreateProductionsPayload,
  FinalizeStagedProductionsPayload,
  ParsedProductionMatchingResultEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ProductionMessagePatterns,
  ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  StageProductionsPayload,
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
import { BatchType, ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';

@Injectable()
export class ProductionService {
  constructor(
    @Inject(BrokerQueues.QUEUE_PROCESS_SVC) private readonly processSvc: ClientProxy,
    private readonly userService: UserService,
  ) { }

  async createProductions(dto: CreateProductionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const payload = new CreateProductionsPayload(
      dto.productionStartedAt,
      dto.productionEndedAt,
      dto.powerProductionUnitId,
      dto.powerAmountKwh,
      dto.hydrogenProductionUnitId,
      dto.hydrogenAmountKg,
      userId,
      dto.hydrogenStorageUnitId,
    );

    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProductionMessagePatterns.CREATE, payload),
    );

    return processSteps
      .filter((processStep) => processStep.type === ProcessType.HYDROGEN_PRODUCTION)
      .map(ProductionOverviewDto.fromEntity);
  }

  async readHydrogenProductionsByCompany(userId: string): Promise<ProductionOverviewDto[]> {
    const userDetails: UserDetailsDto = await this.userService.readUserWithCompany(userId);
    const companyIdOfUser = userDetails.company.id;

    const payload = new ReadProcessStepsByPredecessorTypesAndCompanyPayload(
      [ProcessType.POWER_PRODUCTION],
      companyIdOfUser,
    );

    const productions: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send(ProcessStepMessagePatterns.READ_ALL_BY_PREDECESSOR_TYPES_AND_COMPANY, payload),
    );
    return productions.map(ProductionOverviewDto.fromEntity);
  }

  async importCsvFiles(
    powerProductionFiles: Express.Multer.File[],
    hydrogenProductionFiles: Express.Multer.File[],
    dto: ProductionCSVUploadDto,
    userId: string,
  ) {
    const powerProductions: UnitFileBundle[] = this.createUnitFileBundles(
      powerProductionFiles,
      dto.powerProductionUnitIds,
      BatchType.POWER,
    );

    const hydrogenProductions: UnitFileBundle[] = this.createUnitFileBundles(
      hydrogenProductionFiles,
      dto.hydrogenProductionUnitIds,
      BatchType.HYDROGEN,
    );

    const payload = new StageProductionsPayload(powerProductions, hydrogenProductions, userId);
    const matchingResult = await firstValueFrom(
      this.processSvc.send<ParsedProductionMatchingResultEntity>(ProductionMessagePatterns.STAGE, payload),
    );
    return AccountingPeriodMatchingResultDto.fromEntity(matchingResult);
  }

  private createUnitFileBundles(
    files: Express.Multer.File[],
    unitIds: string | string[],
    type: BatchType,
  ): UnitFileBundle[] {
    if (!files || files.length === 0) {
      throw new BadRequestException(`Missing file for ${type} production.`);
    }

    const normalizedUnitIds = Array.isArray(unitIds) ? unitIds : [unitIds];

    if (normalizedUnitIds.length < files.length) {
      throw new BadRequestException(`Not enough unit IDs provided for ${type} production files: expected ${files.length}, got ${normalizedUnitIds.length}.`);
    }

    return files.map((file, i) => new UnitFileBundle(normalizedUnitIds[i], file));
  }

  async submitCsvData(dto: ImportSubmissionDto, userId: string): Promise<ProductionOverviewDto[]> {
    const payload: FinalizeStagedProductionsPayload = new FinalizeStagedProductionsPayload(
      userId,
      dto.storageUnitId,
      dto.importId,
    );
    const processSteps: ProcessStepEntity[] = await firstValueFrom(
      this.processSvc.send<ProcessStepEntity[]>(ProductionMessagePatterns.FINALIZE, payload),
    );
    return processSteps.map(ProductionOverviewDto.fromEntity);
  }
}
