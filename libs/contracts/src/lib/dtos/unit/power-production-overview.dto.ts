/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitEntity } from '@h2-trust/contracts';

export class PowerProductionOverviewDto {
  id: string;
  name: string;
  ratedPower: number;
  typeName: string;
  producing: boolean;
  active: boolean;

  constructor(id: string, name: string, ratedPower: number, typeName: string, producing: boolean, active: boolean) {
    this.id = id;
    this.name = name;
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.producing = producing;
    this.active = active;
  }

  static fromEntity(unit: PowerProductionUnitEntity): PowerProductionOverviewDto {
    return {
      id: unit.id,
      name: unit.name,
      ratedPower: unit.ratedPower,
      typeName: unit.type?.name ?? undefined,
      producing: true,
      active: unit.active,
    };
  }
}
