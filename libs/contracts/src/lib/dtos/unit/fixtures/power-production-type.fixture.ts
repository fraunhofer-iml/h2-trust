/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionTypeDto } from '@h2-trust/contracts/dtos';
import { EnergySource, PowerProductionType } from '@h2-trust/domain';

export const PowerProductionTypeDtoFixture = {
  create: (overrides: Partial<PowerProductionTypeDto> = {}): PowerProductionTypeDto => ({
    name: overrides.name ?? PowerProductionType.WIND_TURBINE,
    energySource: overrides.energySource ?? EnergySource.RENEWABLE,
  }),
} as const;
