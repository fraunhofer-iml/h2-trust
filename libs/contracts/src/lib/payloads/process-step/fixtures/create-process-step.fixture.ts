/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProcessStepPayload, CreateProcessStepQualityPayloadFixture } from '@h2-trust/contracts/payloads';
import { ProcessType } from '@h2-trust/domain';

export const CreateHydrogenBottlingPayloadFixture = {
  create: (overrides: Partial<CreateProcessStepPayload> = {}): CreateProcessStepPayload =>
    new CreateProcessStepPayload(
      overrides.batchDetails ?? CreateProcessStepQualityPayloadFixture.create(),
      overrides.processType ?? ProcessType.HYDROGEN_TRANSPORTATION,
      overrides.amount ?? 0,
      overrides.ownerId ?? '',
      overrides.recordedById ?? '',
      overrides.startedAt ?? new Date(),
      overrides.endedAt ?? new Date(),
      overrides.executingUnitId ?? '',
      overrides.predecessorUnitId ?? 'transport-unit-1',
      overrides.files ?? [],
    ),
} as const;
