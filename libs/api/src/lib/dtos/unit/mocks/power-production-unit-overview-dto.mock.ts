/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionType } from '@h2-trust/domain';
import { PowerProductionOverviewDto } from '../power-production-overview.dto';

export const PowerProductionUnitOverviewDtoMock = <PowerProductionOverviewDto[]>[
  {
    id: 'power-production-unit-1',
    name: 'Onshore Wind Turbine 3000',
    ratedPower: 0,
    producing: true,
    typeName: PowerProductionType.WIND_TURBINE,
  },
  {
    id: 'power-production-unit-2',
    name: 'Onshore Wind Turbine 4500',
    ratedPower: 0,
    producing: true,
    typeName: PowerProductionType.WIND_TURBINE,
  },
];
