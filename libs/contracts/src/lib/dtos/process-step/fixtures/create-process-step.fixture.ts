/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProcessStepDto } from '@h2-trust/contracts/dtos';
import { ProcessType, RfnboType } from '@h2-trust/domain';
import { CreateQualityDetailsDtoFixture } from './create-quality-details.fixture';

export const CreateProcessStepDtoFixture = {
  create: (overrides: Partial<CreateProcessStepDto> = {}): CreateProcessStepDto => ({
    predecessorUnitId: overrides.predecessorUnitId ?? 'transport-unit-1',
    ...CreateQualityDetailsDtoFixture.create(),
    amount: overrides.amount ?? 1,
    recipient: overrides.recipient ?? 'company-recipient-1',
    filledAt: overrides.filledAt ?? '2025-04-07T00:00:00.000Z',
    recordedBy: overrides.recordedBy ?? 'user-id-1',
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    files: overrides.files ?? [],
    distance: overrides.distance ?? 1000,
    processType: overrides.processType ?? ProcessType.HYDROGEN_BOTTLING,
    executingUnitId: overrides.executingUnitId ?? 'user-1',
  }),
} as const;
