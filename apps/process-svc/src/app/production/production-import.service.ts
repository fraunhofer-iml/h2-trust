/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  AccountingPeriodHydrogen,
  AccountingPeriodPower,
  BrokerException,
  BrokerQueues,
  CreateManyProcessStepsPayload,
  CreateProductionEntity,
  FinalizeStagedProductionsPayload,
  ParsedFileBundles,
  ParsedProductionEntity,
  ParsedProductionMatchingResultEntity,
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  ProcessStepEntity,
  ReadPowerAccessApprovalsPayload,
  StagedProductionEntity,
  StageProductionsPayload,
  UnitDataBundle,
  UnitFileBundle,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { StagedProductionRepository } from '@h2-trust/database';
import { BatchType, PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';
import { AccountingPeriodMatcher } from './accounting-period.matcher';
import { ProductionAssembler } from './production.assembler';
import { CsvParserService } from 'libs/csv-parser/src/lib/csv-parser.service';

@Injectable()
export class ProductionImportService {
  private readonly logger = new Logger(ProductionImportService.name);
  private readonly productionChunkSize: number;

  private readonly headersMap: Record<BatchType, string[]> = {
    POWER: ['time', 'amount'],
    HYDROGEN: ['time', 'amount', 'power'],
    WATER: []
  };

  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly csvParser: CsvParserService,
    private readonly configurationService: ConfigurationService,
    private readonly stagedProductionRepository: StagedProductionRepository,
    private readonly processStepService: ProcessStepService,
  ) {
    this.productionChunkSize = this.configurationService.getProcessSvcConfiguration().productionChunkSize;
  }

  async stageProductions(payload: StageProductionsPayload): Promise<ParsedProductionMatchingResultEntity> {
    // TODO-MP: upload to minio

    const powerProductions = await this.parseBundles<AccountingPeriodPower>(
      BatchType.POWER,
      payload.powerProductions,
    );

    const hydrogenProductions = await this.parseBundles<AccountingPeriodHydrogen>(
      BatchType.HYDROGEN,
      payload.hydrogenProductions,
    );

    const parsedFileBundles = new ParsedFileBundles(powerProductions, hydrogenProductions);

    const gridUnitId = await this.fetchGridUnitId(payload.userId);
    const parsedProductions: ParsedProductionEntity[] = AccountingPeriodMatcher.matchAccountingPeriods(
      parsedFileBundles,
      gridUnitId,
    );

    const importId = await this.stagedProductionRepository.stageParsedProductions(parsedProductions);
    return new ParsedProductionMatchingResultEntity(importId, parsedProductions);
  }

  async parseBundles<T extends AccountingPeriodHydrogen | AccountingPeriodPower>(
    type: BatchType,
    bundle: UnitFileBundle[]
  ): Promise<UnitDataBundle<T>[]> {
    const headers = this.headersMap[type];

    const parsedFiles: UnitDataBundle<T>[] = await Promise.all(
      bundle.map(async (bundle) => {
        const parsedFile: T[] = await this.csvParser.parseFile<T>(bundle.file, headers);
        return new UnitDataBundle<T>(bundle.unitId, parsedFile);
      }),
    );

    if (parsedFiles.some((bundle) => bundle.data.length < 1)) {
      throw new BrokerException(`${type} production file does not contain any valid items.`, HttpStatus.BAD_REQUEST);
    }

    return parsedFiles;
  }

  async finalizeStagedProductions(payload: FinalizeStagedProductionsPayload): Promise<ProcessStepEntity[]> {
    const stagedProductions: StagedProductionEntity[] =
      await this.stagedProductionRepository.getStagedProductionsByImportId(payload.importId);

    const createProductions: CreateProductionEntity[] = stagedProductions.map((stagedProduction) => {
      return new CreateProductionEntity(
        stagedProduction.startedAt,
        new Date(new Date(stagedProduction.startedAt).setMinutes(59, 59, 999)),
        stagedProduction.powerProductionUnitId,
        stagedProduction.powerAmount,
        stagedProduction.hydrogenProductionUnitId,
        stagedProduction.hydrogenAmount,
        payload.recordedBy,
        stagedProduction.hydrogenColor,
        payload.hydrogenStorageUnitId,
        stagedProduction.powerProductionUnitOwnerId,
        stagedProduction.hydrogenProductionUnitOwnerId,
        stagedProduction.waterConsumptionLitersPerHour,
      );
    });

    this.logger.debug(
      `Finalizing ${createProductions.length} staged productions in chunks of ${this.productionChunkSize}`,
    );
    return this.createAndPersistProcessSteps(createProductions);
  }

  private async fetchGridUnitId(userId: string): Promise<string> {
    const approvals: PowerAccessApprovalEntity[] = await firstValueFrom(
      this.generalSvc.send(
        PowerAccessApprovalPatterns.READ,
        new ReadPowerAccessApprovalsPayload(userId, PowerAccessApprovalStatus.APPROVED),
      ),
    );
    const powerAccessApprovalForGrid = approvals.find(
      (approval) => approval.powerProductionUnit.type.name === PowerProductionType.GRID,
    );

    if (!powerAccessApprovalForGrid)
      throw new BrokerException(
        `No grid connection found for user with id ${userId}.`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

    return powerAccessApprovalForGrid.powerProductionUnit.id;
  }

  private async createAndPersistProcessSteps(
    createProductions: CreateProductionEntity[],
  ): Promise<ProcessStepEntity[]> {
    const persistedProcessSteps: ProcessStepEntity[] = [];

    for (let i = 0; i < createProductions.length; i += this.productionChunkSize) {
      const chunk = createProductions.slice(i, i + this.productionChunkSize);

      this.logger.debug(`Processing ${i + 1} to ${Math.min(i + this.productionChunkSize, createProductions.length)}`);

      // Step 1: Create power and water (each returns array with 1 element due to 1:1 relation)
      const power: ProcessStepEntity[] = chunk.flatMap((production) =>
        ProductionAssembler.assemblePowerProductions(production),
      );
      const water: ProcessStepEntity[] = chunk.flatMap((production) =>
        ProductionAssembler.assembleWaterConsumptions(production),
      );

      if (power.length !== chunk.length || water.length !== chunk.length) {
        throw new BrokerException(
          `Expected 1:1 relation between given productions and created process steps, but got ${power.length} power and ${water.length} water for ${chunk.length} productions.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Step 2: Persist power and water
      const persistedPowerAndWater: ProcessStepEntity[] = await this.processStepService.createManyProcessSteps(
        new CreateManyProcessStepsPayload([...power, ...water]),
      );

      // Step 3: Split response back into power and water
      // We use chunk.length because there is a 1:1 relation between productions and process steps,
      // so each production creates exactly one power step and one water step.
      const persistedPower: ProcessStepEntity[] = persistedPowerAndWater.slice(0, chunk.length);
      const persistedWater: ProcessStepEntity[] = persistedPowerAndWater.slice(chunk.length);

      // Step 4: Create hydrogen with persisted predecessors
      const hydrogen: ProcessStepEntity[] = chunk.flatMap((production, index) =>
        ProductionAssembler.assembleHydrogenProductions(production, [persistedPower[index]], [persistedWater[index]]),
      );

      // Step 5: Persist hydrogen
      const persistedHydrogen: ProcessStepEntity[] = await this.processStepService.createManyProcessSteps(
        new CreateManyProcessStepsPayload(hydrogen),
      );

      persistedProcessSteps.push(...persistedPowerAndWater, ...persistedHydrogen);
    }

    return persistedProcessSteps;
  }
}
