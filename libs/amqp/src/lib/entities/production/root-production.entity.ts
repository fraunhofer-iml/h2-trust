/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '../process-step';
import { HydrogenProductionUnitEntity, PowerProductionUnitEntity } from '../unit';

export class RootProductionEntity {
  hydrogenProduction: ProcessStepEntity;
  powerProduction: ProcessStepEntity;
  waterConsumption: ProcessStepEntity;
  powerProductionUnit: PowerProductionUnitEntity;
  hydrogenProductionUnit: HydrogenProductionUnitEntity;

  constructor(
    hydrogenProduction: ProcessStepEntity,
    powerProduction: ProcessStepEntity,
    waterConsumption: ProcessStepEntity,
    powerProductionUnit: PowerProductionUnitEntity,
    hydrogenProductionUnit: HydrogenProductionUnitEntity,
  ) {
    this.hydrogenProduction = hydrogenProduction;
    this.powerProduction = powerProduction;
    this.waterConsumption = waterConsumption;
    this.powerProductionUnit = powerProductionUnit;
    this.hydrogenProductionUnit = hydrogenProductionUnit;
  }
}
