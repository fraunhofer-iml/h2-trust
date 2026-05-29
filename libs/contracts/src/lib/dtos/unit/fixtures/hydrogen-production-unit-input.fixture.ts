/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitInputDto } from '@h2-trust/contracts/dtos';
import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType, UnitType } from '@h2-trust/domain';
import { UnitInputDtoFixture } from './unit-input.fixture';

export const HydrogenProductionUnitInputDtoFixture = {
  create: (overrides: Partial<HydrogenProductionUnitInputDto> = {}): HydrogenProductionUnitInputDto => ({
    ...UnitInputDtoFixture.create({
      ...overrides,
      unitType: overrides.unitType ?? UnitType.HYDROGEN_PRODUCTION,
    }),
    method: overrides.method ?? HydrogenProductionType.ELECTROLYSIS,
    technology: overrides.technology ?? HydrogenProductionTechnology.PEM,
    biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
    ratedPower: overrides.ratedPower ?? 50,
    pressure: overrides.pressure ?? 30,
    waterConsumptionLitersPerHour: overrides.waterConsumptionLitersPerHour ?? 100,
  }),
} as const;
