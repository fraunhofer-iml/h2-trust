/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateHydrogenBottlingPayload } from '@h2-trust/contracts/payloads';
import { RfnboType } from '@h2-trust/domain';

export const CreateHydrogenBottlingPayloadFixture = {
  create: (overrides: Partial<CreateHydrogenBottlingPayload> = {}): CreateHydrogenBottlingPayload =>
    new CreateHydrogenBottlingPayload(
      overrides.amount ?? 100,
      overrides.ownerId ?? 'company-1',
      overrides.filledAt ?? new Date('2026-01-01T03:00:00Z'),
      overrides.recordedById ?? 'user-1',
      overrides.hydrogenStorageUnitId ?? 'hydrogen-storage-unit-1',
      overrides.rfnboType ?? RfnboType.RFNBO_READY,
      overrides.files,
    ),
} as const;
