/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  BrokerException,
  CreateManyProcessStepsPayload,
  CreateProductionEntity,
  FinalizeProductionsPayload,
  ProcessStepEntity,
  StagedProductionEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { StagedProductionRepository } from '@h2-trust/database';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionAssembler } from './production.assembler';


@Injectable()
export class ProductionFinalizationService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly productionChunkSize: number;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly processStepService: ProcessStepService,
    private readonly stagedProductionRepository: StagedProductionRepository,
  ) {
    this.productionChunkSize = this.configurationService.getProcessSvcConfiguration().productionChunkSize;
  }

  async finalizeProductions(payload: FinalizeProductionsPayload): Promise<ProcessStepEntity[]> {
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
