/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { WaterDetailsDto } from '@h2-trust/contracts/dtos';
import { EmissionDtoFixture } from './emission.fixture';

export const WaterDetailsDtoFixture = {
  create: (overrides: Partial<WaterDetailsDto> = {}): WaterDetailsDto => ({
    amount: overrides.amount ?? 100,
    emission: overrides.emission ?? EmissionDtoFixture.create(),
  }),
} as const;