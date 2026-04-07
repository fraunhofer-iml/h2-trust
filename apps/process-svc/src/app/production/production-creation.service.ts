/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  BatchEntity,
  CreateManyProcessStepsPayload,
  CreateProductionEntity,
  ProcessStepEntity,
  ProductionChainEntity,
  UnitEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchType, RfnboType } from '@h2-trust/domain';
import { DigitalProductPassportService } from '../digital-product-passport/digital-product-passport.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionAssembler } from './production.assembler';

@Injectable()
export class ProductionCreationService {
  private readonly logger = new Logger(this.constructor.name);
  private readonly productionChunkSize: number;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly processStepService: ProcessStepService,
    private readonly digitalProductPassportService: DigitalProductPassportService,
  ) {
    this.productionChunkSize = this.configurationService.getProcessSvcConfiguration().productionChunkSize;
  }

  public async createAndPersistProductions(
    createProductions: CreateProductionEntity[],
    productionUnitsForId: Map<string, UnitEntity>,
  ): Promise<ProcessStepEntity[]> {
    const persistedProcessSteps: ProcessStepEntity[] = [];

    const rootProductionsToCreate: ProductionChainEntity[] = createProductions.map((createProduction) =>
      ProductionAssembler.assembleRootProductions(createProduction, productionUnitsForId),
    );

    for (let i = 0; i < rootProductionsToCreate.length; i += this.productionChunkSize) {
      const createRootProductionsChunk: ProductionChainEntity[] = rootProductionsToCreate.slice(
        i,
        i + this.productionChunkSize,
      );

      this.logger.debug(`Processing ${i + 1} to ${Math.min(i + this.productionChunkSize, createProductions.length)}`);

      // Step 1: Create power and water (each returns array with 1 element due to 1:1 relation)
      const power: ProcessStepEntity[] = createRootProductionsChunk.flatMap((production) => production.powerProduction);
      const water: ProcessStepEntity[] = createRootProductionsChunk.flatMap(
        (production) => production.waterConsumption,
      );

      // Step 2: Persist power and water
      const persistedPowerAndWater: ProcessStepEntity[] = await this.processStepService.createManyProcessSteps(
        new CreateManyProcessStepsPayload([...power, ...water]),
      );

      // Step 3: Split response back into power and water
      const persistedPower: BatchEntity[] = persistedPowerAndWater
        .filter((processStep) => processStep.batch.type == BatchType.POWER)
        .map((processStep) => processStep.batch);
      const persistedWater: BatchEntity[] = persistedPowerAndWater
        .filter((processStep) => processStep.batch.type == BatchType.WATER)
        .map((processStep) => processStep.batch);

      // Step 4: Create hydrogen with persisted predecessors
      const hydrogen: ProcessStepEntity[] = createRootProductionsChunk.map((rootProduction) => {
        const rfnboType: RfnboType = this.digitalProductPassportService.getRfnboType(rootProduction);
        const hydrogenProduction: ProcessStepEntity = rootProduction.hydrogenRootProduction;
        hydrogenProduction.batch.qualityDetails.rfnboType = rfnboType;
        hydrogenProduction.batch.predecessors = [...persistedPower, ...persistedWater];
        return hydrogenProduction;
      });

      // Step 5: Persist hydrogen
      const persistedHydrogen: ProcessStepEntity[] = await this.processStepService.createManyProcessSteps(
        new CreateManyProcessStepsPayload(hydrogen),
      );

      persistedProcessSteps.push(...persistedPowerAndWater, ...persistedHydrogen);
    }

    return persistedProcessSteps;
  }
}
