/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadProcessStepsByTypesAndActiveAndOwnerPayload } from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';

export const ReadProcessStepsByTypesAndActiveAndOwnerPayloadFixture = {
  create: (
    overrides: Partial<ReadProcessStepsByTypesAndActiveAndOwnerPayload> = {},
  ): ReadProcessStepsByTypesAndActiveAndOwnerPayload =>
    new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
      overrides.processTypes ?? [ProcessType.HYDROGEN_PRODUCTION, ProcessType.HYDROGEN_BOTTLING],
      overrides.active ?? true,
      overrides.ownerId ?? 'company-1',
    ),
} as const;
