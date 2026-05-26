/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionOverviewDto } from '@h2-trust/contracts/dtos';
import { PowerProductionType, UnitType } from '@h2-trust/domain';

export const PowerProductionOverviewDtoFixture = {
  create: (overrides: Partial<PowerProductionOverviewDto> = {}): PowerProductionOverviewDto => ({
    id: overrides.id ?? 'power-production-unit-1',
    name: overrides.name ?? 'Windpark Nord',
    ratedPower: overrides.ratedPower ?? 25,
    typeName: overrides.typeName ?? PowerProductionType.WIND_TURBINE,
    unitType: UnitType.POWER_PRODUCTION,
    active: overrides.active ?? true,
  }),
} as const;
