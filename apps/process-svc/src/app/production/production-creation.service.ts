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
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ProductionService } from './production.service';

@Injectable()
export class ProductionCreationService {
  constructor(
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

    const [powerProductions, waterConsumptions] = await Promise.all([
      this.productionService.createPowerProductions(createProductionEntity),
      this.productionService.createWaterConsumptions(createProductionEntity),
    ]);

    const hydrogenProductions = await this.productionService.createHydrogenProductions(createProductionEntity, powerProductions, waterConsumptions);

    return [...powerProductions, ...waterConsumptions, ...hydrogenProductions];
  }
}
