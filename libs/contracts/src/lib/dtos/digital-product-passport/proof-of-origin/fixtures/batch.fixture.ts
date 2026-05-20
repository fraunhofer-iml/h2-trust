/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDto } from '@h2-trust/contracts/dtos';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';
import { EmissionDtoFixture } from './emission.fixture';

export const BatchDtoFixture = {
  create: (overrides: Partial<BatchDto> = {}): BatchDto => ({
    id: overrides.id ?? 'batch-1',
    emission: overrides.emission ?? EmissionDtoFixture.create(),
    createdAt: overrides.createdAt ?? new Date('2025-04-07T08:00:00.000Z'),
    amount: overrides.amount ?? 10,
    unit: overrides.unit ?? MeasurementUnit.KG,
    batchType: overrides.batchType ?? BatchType.HYDROGEN,
  }),
} as const;
