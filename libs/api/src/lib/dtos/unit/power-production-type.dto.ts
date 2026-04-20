/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { EnergySource, HydrogenColor } from '@h2-trust/domain';

export class PowerProductionTypeDto {
  name: string;
  energySource: EnergySource;
  hydrogenColor: HydrogenColor;

  constructor(name: string, energySource: EnergySource, hydrogenColor: HydrogenColor) {
    this.name = name;
    this.energySource = energySource;
    this.hydrogenColor = hydrogenColor;
  }
}
