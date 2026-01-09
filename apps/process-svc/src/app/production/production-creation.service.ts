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
  CreateManyProcessStepsPayload,
  CreateProductionEntity,
  CreateProductionsPayload,
  HydrogenProductionUnitEntity,
  PowerProductionUnitEntity,
  ProcessStepEntity,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ProcessStepService } from '../process-step/process-step.service';
import { ProductionService } from './production.service';

@Injectable()
export class ProductionCreationService {
  constructor(
    @Inject(BrokerQueues.QUEUE_GENERAL_SVC) private readonly generalSvc: ClientProxy,
    private readonly processStepService: ProcessStepService,
    private readonly productionService: ProductionService,
  ) {}

  async createProductions(payload: CreateProductionsPayload): Promise<ProcessStepEntity[]> {
    const powerProductionUnit: PowerProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(payload.powerProductionUnitId)),
    );

    const hydrogenProductionUnit: HydrogenProductionUnitEntity = await firstValueFrom(
      this.generalSvc.send(UnitMessagePatterns.READ, new ReadByIdPayload(payload.hydrogenProductionUnitId)),
    );

    const entity: CreateProductionEntity = new CreateProductionEntity(
      payload.productionStartedAt,
      payload.productionEndedAt,
      payload.powerProductionUnitId,
      payload.powerAmountKwh,
      payload.hydrogenProductionUnitId,
      payload.hydrogenAmountKg,
      payload.userId,
      powerProductionUnit.type.hydrogenColor,
      payload.hydrogenStorageUnitId,
      powerProductionUnit.company.id,
      hydrogenProductionUnit.company.id,
      hydrogenProductionUnit.waterConsumptionLitersPerHour,
    );

    // Step 1: Create power and water
    const power: ProcessStepEntity[] = this.productionService.createPowerProductions(entity);
    const water: ProcessStepEntity[] = this.productionService.createWaterConsumptions(entity);

    if (power.length !== water.length) {
      throw new Error(
        `Mismatch in created power and water process steps count: ${power.length} power steps vs ${water.length} water steps`,
      );
    }

    const powerAndWaterPayload: CreateManyProcessStepsPayload = new CreateManyProcessStepsPayload([...power, ...water]);

    // Step 2: Persist power and water
    const persistedPowerAndWater: ProcessStepEntity[] =
      await this.processStepService.createManyProcessSteps(powerAndWaterPayload);

    // Step 3: Split response back into power and water (1:1 relation)
    const persistedPower: ProcessStepEntity[] = persistedPowerAndWater.slice(0, power.length);
    const persistedWater: ProcessStepEntity[] = persistedPowerAndWater.slice(power.length);

    // Step 4: Create hydrogen with persisted predecessors
    const hydrogen: ProcessStepEntity[] = this.productionService.createHydrogenProductions(
      entity,
      persistedPower,
      persistedWater,
    );

    const hydrogenPayload: CreateManyProcessStepsPayload = new CreateManyProcessStepsPayload(hydrogen);

    // Step 5: Persist hydrogen
    const persistedHydrogen: ProcessStepEntity[] =
      await this.processStepService.createManyProcessSteps(hydrogenPayload);

    return [...persistedPowerAndWater, ...persistedHydrogen];
  }
}
