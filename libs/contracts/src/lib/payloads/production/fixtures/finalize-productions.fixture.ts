/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FinalizeProductionsPayload } from '@h2-trust/contracts/payloads';

export const FinalizeProductionsPayloadFixture = {
  create: (overrides: Partial<FinalizeProductionsPayload> = {}): FinalizeProductionsPayload =>
    new FinalizeProductionsPayload(
      overrides.recordedBy ?? 'user-1',
      overrides.stagedHydrogenProduction ?? 'staged-hydrogen-production-1',
      overrides.stagedPowerProductions ?? ['staged-power-production-1', 'staged-power-production-2'],
      overrides.storageUnitId ?? 'hydrogen-storage-unit-1',
    ),
} as const;
