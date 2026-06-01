/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TransportUnitEntity } from '@h2-trust/contracts/entities';
import { FuelType, TransportType } from '@h2-trust/domain';

export class HydrogenTransportOverviewDto {
  id: string;
  type: TransportType;
  fuelType: FuelType;
  active: boolean;

  constructor(id: string, type: TransportType, fuelType: FuelType, active: boolean) {
    this.id = id;
    this.type = type;
    this.fuelType = fuelType;
    this.active = active;
  }

  static fromEntity(unit: TransportUnitEntity): HydrogenTransportOverviewDto {
    return {
      id: unit.id,
      type: unit.type,
      fuelType: unit.fuelType,
      active: unit.active,
    };
  }
}
