/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionTypeDbType } from '@h2-trust/database';
import { EnergySource, PowerProductionType } from '@h2-trust/domain';

export class PowerProductionTypeEntity {
  name: PowerProductionType;
  energySource: EnergySource;
  hydrogenColor: string;

  constructor(name: PowerProductionType, energySource: EnergySource, hydrogenColor: string) {
    this.name = name;
    this.energySource = energySource;
    this.hydrogenColor = hydrogenColor;
  }

  static fromDatabase(powerProductionUnitDbType: PowerProductionTypeDbType): PowerProductionTypeEntity {
    const energySource = powerProductionUnitDbType.energySource?.toUpperCase() as EnergySource;
    const validEnergySource = Object.values(EnergySource).includes(energySource) ? energySource : null;

    return <PowerProductionTypeEntity>{
      name: powerProductionUnitDbType.name,
      energySource: validEnergySource,
      hydrogenColor: powerProductionUnitDbType.hydrogenColor,
    };
  }
}
