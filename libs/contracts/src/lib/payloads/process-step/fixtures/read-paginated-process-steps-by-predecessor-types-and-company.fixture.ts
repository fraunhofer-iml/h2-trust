/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload } from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';
import { ProductionDataFilter } from '../production-data-filter';

const createProductionDataFilter = (overrides: Partial<ProductionDataFilter> = {}): ProductionDataFilter =>
  new ProductionDataFilter(
    overrides.pageNumber ?? 0,
    overrides.pageSize ?? 25,
    overrides.unitName ?? 'Hydrogen Production Unit 1',
    overrides.month ?? new Date('2026-01-01T00:00:00Z'),
  );

export const ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayloadFixture = {
  create: (
    overrides: Partial<ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload> = {},
  ): ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload =>
    new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
      overrides.predecessorProcessTypes ?? [ProcessType.POWER_PRODUCTION, ProcessType.WATER_CONSUMPTION],
      overrides.ownerId ?? 'company-1',
      overrides.filter ?? createProductionDataFilter(),
    ),
} as const;
