/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitInputDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, GridLevel, PowerProductionType, UnitType } from '@h2-trust/domain';
import { UnitInputDtoFixture } from './unit-input.fixture';

export const PowerProductionUnitInputDtoFixture = {
  create: (overrides: Partial<PowerProductionUnitInputDto> = {}): PowerProductionUnitInputDto => ({
    ...UnitInputDtoFixture.create({
      ...overrides,
      unitType: overrides.unitType ?? UnitType.POWER_PRODUCTION,
    }),
    powerProductionType: overrides.powerProductionType ?? PowerProductionType.WIND_TURBINE,
    decommissioningPlannedOn: overrides.decommissioningPlannedOn ?? new Date('2040-01-01T00:00:00.000Z'),
    biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
    gridOperator: overrides.gridOperator ?? 'Grid Operator AG',
    gridLevel: overrides.gridLevel ?? GridLevel.MEDIUM_VOLTAGE,
    gridConnectionNumber: overrides.gridConnectionNumber ?? 'GCN-001',
    ratedPower: overrides.ratedPower ?? 25,
    electricityMeterNumber: overrides.electricityMeterNumber ?? 'EM-001',
    financialSupportReceived: overrides.financialSupportReceived ?? false,
  }),
} as const;