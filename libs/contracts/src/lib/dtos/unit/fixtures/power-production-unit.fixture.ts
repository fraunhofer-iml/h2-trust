/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, GridLevel, UnitType } from '@h2-trust/domain';
import { BaseUnitDtoFixture } from './base-unit.fixture';
import { PowerProductionTypeDtoFixture } from './power-production-type.fixture';

export const PowerProductionUnitDtoFixture = {
  create: (overrides: Partial<PowerProductionUnitDto> = {}): PowerProductionUnitDto => ({
    ...BaseUnitDtoFixture.create({
      id: overrides.id,
      name: overrides.name,
      mastrNumber: overrides.mastrNumber,
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
    electricityMeterNumber: overrides.electricityMeterNumber ?? 'EM-001',
    gridOperator: overrides.gridOperator ?? 'Grid Operator AG',
    gridConnectionNumber: overrides.gridConnectionNumber ?? 'GCN-001',
    gridLevel: overrides.gridLevel ?? GridLevel.MEDIUM_VOLTAGE,
    biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
    ratedPower: overrides.ratedPower ?? 25,
    decommissioningPlannedOn: overrides.decommissioningPlannedOn ?? new Date('2040-01-01T00:00:00.000Z'),
    type: overrides.type ?? PowerProductionTypeDtoFixture.create(),
    financialSupportReceived: overrides.financialSupportReceived ?? false,
  }),
} as const;