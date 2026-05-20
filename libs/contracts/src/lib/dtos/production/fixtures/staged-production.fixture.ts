/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagedProductionDto } from '@h2-trust/contracts/dtos';
import { CsvContentType } from '@h2-trust/domain';

export const StagedProductionDtoFixture = {
  create: (overrides: Partial<StagedProductionDto> = {}): StagedProductionDto => ({
    id: overrides.id ?? 'staged-production-1',
    startedAt: overrides.startedAt ?? new Date('2025-04-07T08:00:00.000Z'),
    endedAt: overrides.endedAt ?? new Date('2025-04-07T16:00:00.000Z'),
    amountProduced: overrides.amountProduced ?? 10,
    csvContentType: overrides.csvContentType ?? CsvContentType.HYDROGEN,
    uploadedBy: overrides.uploadedBy ?? 'PowerGen AG',
    productionUnitId: overrides.productionUnitId ?? 'hydrogen-production-unit-1',
    powerConsumed: overrides.powerConsumed ?? 120,
  }),
} as const;