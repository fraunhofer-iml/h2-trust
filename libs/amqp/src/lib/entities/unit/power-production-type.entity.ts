/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionTypeDbType } from '@h2-trust/database';

export class PowerProductionTypeEntity {
  name?: string;
  energySource?: string;
  hydrogenColor?: string;

  constructor(name: string, energySource: string, hydrogenColor: string) {
    this.name = name;
    this.energySource = energySource;
    this.hydrogenColor = hydrogenColor;
  }

  static fromDatabase(powerProductionUnitDbType: PowerProductionTypeDbType): PowerProductionTypeEntity {
    return <PowerProductionTypeEntity>{
      name: powerProductionUnitDbType.name,
      energySource: powerProductionUnitDbType.energySource,
      hydrogenColor: powerProductionUnitDbType.hydrogenColor,
    };
  }
}
