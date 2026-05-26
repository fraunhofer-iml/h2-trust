/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProductionsPayload } from '@h2-trust/contracts/payloads';

export const CreateProductionsPayloadFixture = {
  create: (overrides: Partial<CreateProductionsPayload> = {}): CreateProductionsPayload =>
    new CreateProductionsPayload(
      overrides.productionStartedAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.productionEndedAt ?? new Date('2026-01-01T02:00:00Z'),
      overrides.powerProductionUnitId ?? 'power-production-unit-1',
      overrides.powerAmountKwh ?? 1000,
      overrides.hydrogenProductionUnitId ?? 'hydrogen-production-unit-1',
      overrides.hydrogenAmountKg ?? 50,
      overrides.userId ?? 'user-1',
      overrides.hydrogenStorageUnitId ?? 'hydrogen-storage-unit-1',
    ),
} as const;
