/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProductionDto } from '@h2-trust/contracts/dtos';

export const CreateProductionDtoFixture = {
  create: (overrides: Partial<CreateProductionDto> = {}): CreateProductionDto => ({
    productionStartedAt: overrides.productionStartedAt ?? new Date('2025-04-07T08:00:00.000Z'),
    productionEndedAt: overrides.productionEndedAt ?? new Date('2025-04-07T16:00:00.000Z'),
    powerProductionUnitId: overrides.powerProductionUnitId ?? 'power-production-unit-1',
    powerAmountKwh: overrides.powerAmountKwh ?? 120,
    hydrogenProductionUnitId: overrides.hydrogenProductionUnitId ?? 'hydrogen-production-unit-1',
    hydrogenAmountKg: overrides.hydrogenAmountKg ?? 10,
    hydrogenStorageUnitId: overrides.hydrogenStorageUnitId ?? 'hydrogen-storage-unit-1',
  }),
} as const;