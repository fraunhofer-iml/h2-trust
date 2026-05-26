/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadProcessStepsByPredecessorTypesAndOwnerPayload } from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';

export const ReadProcessStepsByPredecessorTypesAndOwnerPayloadFixture = {
  create: (
    overrides: Partial<ReadProcessStepsByPredecessorTypesAndOwnerPayload> = {},
  ): ReadProcessStepsByPredecessorTypesAndOwnerPayload =>
    new ReadProcessStepsByPredecessorTypesAndOwnerPayload(
      overrides.predecessorProcessTypes ?? [ProcessType.POWER_PRODUCTION, ProcessType.WATER_CONSUMPTION],
      overrides.ownerId ?? 'company-1',
    ),
} as const;
