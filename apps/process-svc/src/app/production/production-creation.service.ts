/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BrokerQueues,
  CreateProductionEntity,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ProductionService } from './production.service';

@Injectable()
export class ProductionCreationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchSvc: ClientProxy,
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly productionService: ProductionService,
  ) { }

  async createProductions(createProductionEntity: CreateProductionEntity): Promise<ProcessStepEntity[]> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, { id: createProductionEntity.powerProductionUnitId }),
    );

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, { id: createProductionEntity.hydrogenProductionUnitId }),
    );

    createProductionEntity.hydrogenColor = powerProductionUnit.type.hydrogenColor;
    createProductionEntity.companyIdOfPowerProductionUnit = powerProductionUnit.company.id;
    createProductionEntity.companyIdOfHydrogenProductionUnit = hydrogenProductionUnit.company.id;
    createProductionEntity.waterConsumptionLitersPerHour = hydrogenProductionUnit.waterConsumptionLitersPerHour;

    // Step 1: Create power and water
    const power: ProcessStepEntity[] = this.productionService.createPowerProductions(createProductionEntity);
    const water: ProcessStepEntity[] = this.productionService.createWaterConsumptions(createProductionEntity);

    if (power.length !== water.length) {
      throw new Error(`Mismatch in created power and water process steps count: ${power.length} power steps vs ${water.length} water steps`);
    }

    // Step 2: Persist power and water
    const persistedPowerAndWater: ProcessStepEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CREATE_MANY, {
        processSteps: [...power, ...water],
      }),
    );

    // Step 3: Split response back into power and water (1:1 relation)
    const persistedPower: ProcessStepEntity[] = persistedPowerAndWater.slice(0, power.length);
    const persistedWater: ProcessStepEntity[] = persistedPowerAndWater.slice(power.length);

    // Step 4: Create hydrogen with persisted predecessors
    const hydrogen: ProcessStepEntity[] = this.productionService.createHydrogenProductions(
      createProductionEntity,
      persistedPower,
      persistedWater,
    );

    // Step 5: Persist hydrogen
    const persistedHydrogen: ProcessStepEntity[] = await firstValueFrom(
      this.batchSvc.send(ProcessStepMessagePatterns.CREATE_MANY, { processSteps: hydrogen }),
    );

    return [...persistedPowerAndWater, ...persistedHydrogen];
  }
}
