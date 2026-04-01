/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '../process-step';
import { HydrogenProductionUnitEntity, PowerProductionUnitEntity } from '../unit';

/**
 * This entity holds the process steps and the units of a hydrogen production.
 * hydrogenRootProduction: The hydrogen production process step that only have PP and WC as predecessors.
 * hydrogenLeafProduction: The hydrogen production process step that dont have a hydrogen production as successor.
 * (if the hydrogenRootProduction does not have any HP successors it is the root and leaf HP)
 *
 * ProductionChain: PP/WC -> rootHP -> ... -> HP -> ... -> leafHP
 */
export class ProductionChainEntity {
  hydrogenLeafProduction: ProcessStepEntity;
  hydrogenRootProduction: ProcessStepEntity;
  powerProduction: ProcessStepEntity;
  waterConsumption: ProcessStepEntity;
  powerProductionUnit: PowerProductionUnitEntity;
  hydrogenProductionUnit: HydrogenProductionUnitEntity;

  constructor(
    hydrogenLeafProduction: ProcessStepEntity,
    hydrogenRootProduction: ProcessStepEntity,
    powerProduction: ProcessStepEntity,
    waterConsumption: ProcessStepEntity,
    powerProductionUnit: PowerProductionUnitEntity,
    hydrogenProductionUnit: HydrogenProductionUnitEntity,
  ) {
    this.hydrogenLeafProduction = hydrogenLeafProduction;
    this.hydrogenRootProduction = hydrogenRootProduction;
    this.powerProduction = powerProduction;
    this.waterConsumption = waterConsumption;
    this.powerProductionUnit = powerProductionUnit;
    this.hydrogenProductionUnit = hydrogenProductionUnit;
  }
}
