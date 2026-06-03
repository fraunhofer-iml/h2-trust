/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { BiddingZone, PowerProductionType, UnitType } from '@h2-trust/domain';
import { assertDefined, assertValidEnum } from '@h2-trust/utils';

export class PowerProductionOverviewDto {
  id: string;
  name: string;
  unitType: UnitType;
  ratedPower: number;
  typeName: PowerProductionType;
  active: boolean;

  constructor(
    id: string,
    name: string,
    unitType: UnitType,
    ratedPower: number,
    typeName: PowerProductionType,
    active: boolean,
  ) {
    this.id = id;
    this.name = name;
    this.unitType = unitType;
    this.ratedPower = ratedPower;
    this.typeName = typeName;
    this.active = active;
  }

  static fromEntity(unit: UnitEntity): PowerProductionOverviewDto {
    assertValidEnum(unit.specification.type, PowerProductionType, 'PowerProductionType');
    assertDefined(unit.specification.decommissioningPlannedOn, 'decommissioningPlannedOn');
    assertValidEnum(unit.specification.biddingZone, BiddingZone, 'BiddingZone');
    return {
      id: unit.id,
      name: unit.name,
      unitType: UnitType.POWER_PRODUCTION,
      ratedPower: unit.specification.ratedPower ?? 0,
      typeName: unit.specification.type,
      active: unit.active,
    };
  }
}
