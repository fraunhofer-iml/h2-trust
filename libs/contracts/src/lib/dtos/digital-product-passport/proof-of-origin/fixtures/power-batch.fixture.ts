/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerBatchDto } from '@h2-trust/contracts/dtos';
import { BatchType, MeasurementUnit, PowerProductionType, PowerType } from '@h2-trust/domain';
import { EmissionDtoFixture } from './emission.fixture';

export const PowerBatchDtoFixture = {
  create: (overrides: Partial<PowerBatchDto> = {}): PowerBatchDto => ({
    id: overrides.id ?? 'power-batch-1',
    emission: overrides.emission ?? EmissionDtoFixture.create(),
    createdAt: overrides.createdAt ?? new Date('2025-04-07T08:00:00.000Z'),
    amount: overrides.amount ?? 100,
    unit: overrides.unit ?? MeasurementUnit.KWH,
    batchType: overrides.batchType ?? BatchType.POWER,
    producer: overrides.producer ?? 'PowerGen AG',
    unitId: overrides.unitId ?? 'power-production-unit-1',
    powerProductionType: overrides.powerProductionType ?? PowerProductionType.WIND_TURBINE,
    accountingPeriodEnd: overrides.accountingPeriodEnd ?? new Date('2025-04-30T23:59:59.000Z'),
    powerType: overrides.powerType ?? PowerType.RENEWABLE,
  }),
} as const;
