/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionTypeDbType } from '@h2-trust/database';
import { EnergySource, HydrogenColor, PowerProductionType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class PowerProductionTypeEntity {
  name: PowerProductionType;
  energySource: EnergySource;
  hydrogenColor: HydrogenColor;

  constructor(name: PowerProductionType, energySource: EnergySource, hydrogenColor: HydrogenColor) {
    this.name = name;
    this.energySource = energySource;
    this.hydrogenColor = hydrogenColor;
  }

  static fromDatabase(powerProductionUnitDbType: PowerProductionTypeDbType): PowerProductionTypeEntity {
    assertValidEnum(powerProductionUnitDbType.energySource?.toUpperCase(), EnergySource);
    assertValidEnum(powerProductionUnitDbType.hydrogenColor, HydrogenColor);

    const energySource = powerProductionUnitDbType.energySource?.toUpperCase() as EnergySource;
    const validEnergySource = Object.values(EnergySource).includes(energySource) ? energySource : null;

    return <PowerProductionTypeEntity>{
      name: powerProductionUnitDbType.name,
      energySource: validEnergySource,
      hydrogenColor: powerProductionUnitDbType.hydrogenColor,
    };
  }
}
