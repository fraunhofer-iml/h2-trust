/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { WaterBatchDto } from '@h2-trust/contracts/dtos';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';
import { EmissionDtoFixture } from './emission.fixture';
import { WaterDetailsDtoFixture } from './water-details.fixture';

export const WaterBatchDtoFixture = {
  create: (overrides: Partial<WaterBatchDto> = {}): WaterBatchDto => ({
    id: overrides.id ?? 'water-batch-1',
    emission: overrides.emission ?? EmissionDtoFixture.create(),
    createdAt: overrides.createdAt ?? new Date('2025-04-07T08:00:00.000Z'),
    amount: overrides.amount ?? 100,
    unit: overrides.unit ?? MeasurementUnit.L,
    batchType: overrides.batchType ?? BatchType.WATER,
    deionizedWater: overrides.deionizedWater ?? WaterDetailsDtoFixture.create(),
  }),
} as const;
