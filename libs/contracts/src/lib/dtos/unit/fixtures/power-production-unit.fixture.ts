/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, PowerProductionType, UnitType } from '@h2-trust/domain';
import { BaseUnitDtoFixture } from './base-unit.fixture';

export const PowerProductionUnitDtoFixture = {
  create: (overrides: Partial<PowerProductionUnitDto> = {}): PowerProductionUnitDto => ({
    ...BaseUnitDtoFixture.create({
      id: overrides.id,
      name: overrides.name,
      manufacturer: overrides.manufacturer,
      modelType: overrides.modelType,
      modelNumber: overrides.modelNumber,
      serialNumber: overrides.serialNumber,
      certifiedBy: overrides.certifiedBy,
      commissionedOn: overrides.commissionedOn,
      address: overrides.address,
      owner: overrides.owner,
      operator: overrides.operator,
      unitType: overrides.unitType ?? UnitType.POWER_PRODUCTION,
      active: overrides.active,
    }),
    biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
    ratedPower: overrides.ratedPower ?? 25,
    decommissioningPlannedOn: overrides.decommissioningPlannedOn ?? new Date('2040-01-01T00:00:00.000Z'),
    type: overrides.type ?? PowerProductionType.GRID,
    financialSupportReceived: overrides.financialSupportReceived ?? false,
  }),
} as const;
