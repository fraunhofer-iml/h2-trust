/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenBatchDto } from '@h2-trust/contracts/dtos';
import { BatchType, HydrogenProductionType, MeasurementUnit, ProcessType, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentDtoFixture } from '../../general-information/fixtures';
import { EmissionDtoFixture } from './emission.fixture';

export const HydrogenBatchDtoFixture = {
  create: (overrides: Partial<HydrogenBatchDto> = {}): HydrogenBatchDto => ({
    id: overrides.id ?? 'hydrogen-batch-1',
    emission: overrides.emission ?? EmissionDtoFixture.create(),
    createdAt: overrides.createdAt ?? new Date('2025-04-07T08:00:00.000Z'),
    amount: overrides.amount ?? 10,
    unit: overrides.unit ?? MeasurementUnit.KG,
    batchType: overrides.batchType ?? BatchType.HYDROGEN,
    producer: overrides.producer ?? 'HydroGen GmbH',
    unitId: overrides.unitId ?? 'hydrogen-production-unit-1',
    typeOfProduction: overrides.typeOfProduction ?? HydrogenProductionType.ELECTROLYSIS,
    hydrogenComposition: overrides.hydrogenComposition ?? [HydrogenComponentDtoFixture.create()],
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    processStep: overrides.processStep ?? ProcessType.HYDROGEN_PRODUCTION,
    accountingPeriodEnd: overrides.accountingPeriodEnd ?? new Date('2025-04-30T23:59:59.000Z'),
  }),
} as const;
