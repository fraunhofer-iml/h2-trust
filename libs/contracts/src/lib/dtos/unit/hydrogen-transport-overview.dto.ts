/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { FuelType, TransportType, UnitType } from '@h2-trust/domain';
import { assertValidEnum } from '@h2-trust/utils';

export class HydrogenTransportOverviewDto {
  id: string;
  name: string;
  unitType: UnitType;
  type: TransportType;
  fuelType: FuelType;
  active: boolean;

  constructor(id: string, name: string, unitType: UnitType, type: TransportType, fuelType: FuelType, active: boolean) {
    this.id = id;
    this.name = name;
    this.unitType = unitType;
    this.type = type;
    this.fuelType = fuelType;
    this.active = active;
  }

  static fromEntity(unit: UnitEntity): HydrogenTransportOverviewDto {
    assertValidEnum(unit.specification.type, TransportType, 'TransportType');
    assertValidEnum(unit.specification.fuelType, FuelType, 'FuelType');
    return {
      id: unit.id,
      name: unit.name,
      unitType: unit.unitType,
      type: unit.specification.type,
      fuelType: unit.specification.fuelType,
      active: unit.active,
    };
  }
}
