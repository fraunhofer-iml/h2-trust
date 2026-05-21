/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PaginatedProductionDataDto } from '@h2-trust/contracts/dtos';
import { ProductionOverviewDtoFixture } from './production-overview.fixture';

export const PaginatedProductionDataDtoFixture = {
  create: (overrides: Partial<PaginatedProductionDataDto> = {}): PaginatedProductionDataDto => ({
    data: overrides.data ?? [ProductionOverviewDtoFixture.create()],
    totalItems: overrides.totalItems ?? 1,
    currentPage: overrides.currentPage ?? 1,
  }),
} as const;
