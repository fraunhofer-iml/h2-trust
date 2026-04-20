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
  ConcreteUnitEntity,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchType, RfnboType } from '@h2-trust/domain';
import { DigitalProductPassportService } from '../digital-product-passport/digital-product-passport.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionAssembler } from './production.assembler';
import { CreateManyProcessStepsPayload, CreateProductionEntity, HydrogenProductionUnitEntity, PowerProductionUnitEntity, ProcessStepEntity, ProductionChainEntity } from '@h2-trust/contracts';

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
    productionUnitsForId: Map<string, ConcreteUnitEntity>,
  ): Promise<ProcessStepEntity[]> {
    const persistedProcessSteps: ProcessStepEntity[] = [];

    for (let i = 0; i < createProductions.length; i += this.productionChunkSize) {
      const createProductionsChunk = createProductions.slice(i, i + this.productionChunkSize);

      this.logger.debug(`Processing ${i + 1} to ${Math.min(i + this.productionChunkSize, createProductions.length)}`);

      // Step 1: Create power and water (each returns array with 1 element due to 1:1 relation)
      const power: ProcessStepEntity[] = createProductionsChunk.flatMap((production) =>
        ProductionAssembler.assemblePowerProductions(production, productionUnitsForId),
      );
      const water: ProcessStepEntity[] = createProductionsChunk.flatMap((production) =>
        ProductionAssembler.assembleWaterConsumptions(production, productionUnitsForId),
      );

      if (power.length !== createProductionsChunk.length || water.length !== createProductionsChunk.length) {
        throw new BrokerException(
          `Expected 1:1 relation between given productions and created process steps, but got ${power.length} power and ${water.length} water for ${createProductionsChunk.length} productions.`,
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
      const persistedPower: ProcessStepEntity[] = persistedPowerAndWater.filter(
        (processStep) => processStep.batch.type == BatchType.POWER,
      );
      const persistedWater: ProcessStepEntity[] = persistedPowerAndWater.filter(
        (processStep) => processStep.batch.type == BatchType.WATER,
      );

      if (persistedPower.length !== persistedWater.length) {
        throw new BrokerException(
          `Expected 1:1 relation between power and water process steps, but got ${persistedPower.length} power and ${persistedWater.length} water.`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Step 4: Create hydrogen with persisted predecessors
      const hydrogenToPersist: ProcessStepEntity[] = createProductionsChunk.flatMap((production, index) =>
        ProductionAssembler.assembleHydrogenProductions(
          production,
          [persistedPower[index]],
          [persistedWater[index]],
          productionUnitsForId,
        ),
      );

      // Step 5: Add RFNBO Type to hydrogen
      hydrogenToPersist.map((hydrogen) => {
        const predecessorIds: string[] = hydrogen.batch.predecessors.map((pred) => pred.processStepId);
        const powerProduction: ProcessStepEntity = persistedPower.find((power) => predecessorIds.includes(power.id));
        const waterConsumption: ProcessStepEntity = persistedWater.find((water) => predecessorIds.includes(water.id));

        const productionChain: ProductionChainEntity = new ProductionChainEntity(
          hydrogen,
          hydrogen,
          powerProduction,
          waterConsumption,
          powerProduction.executedBy as PowerProductionUnitEntity,
          waterConsumption.executedBy as HydrogenProductionUnitEntity,
        );
        const rfnboType: RfnboType = this.digitalProductPassportService.getRfnboType(productionChain);
        hydrogen.batch.qualityDetails.rfnboType = rfnboType;
        return hydrogen;
      });

      // Step 6: Persist hydrogen
      const persistedHydrogen: ProcessStepEntity[] = await this.processStepService.createManyProcessSteps(
        new CreateManyProcessStepsPayload(hydrogenToPersist),
      );

      persistedProcessSteps.push(...persistedPowerAndWater, ...persistedHydrogen);
    }

    return persistedProcessSteps;
  }
}
