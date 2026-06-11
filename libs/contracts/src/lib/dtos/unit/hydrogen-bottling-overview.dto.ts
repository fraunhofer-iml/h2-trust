/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { UnitType } from '@h2-trust/domain';

export class HydrogenBottlingOverviewDto {
  id: string;
  name: string;
  unitType: UnitType;
  active: boolean;

  constructor(id: string, name: string, unitType: UnitType, active: boolean) {
    this.id = id;
    this.name = name;
    this.unitType = unitType;
    this.active = active;
  }

  static fromEntity(unit: UnitEntity): HydrogenBottlingOverviewDto {
    return {
      id: unit.id,
      name: unit.name,
      unitType: UnitType.BOTTLING,
      active: unit.active,
    };
  }
}
