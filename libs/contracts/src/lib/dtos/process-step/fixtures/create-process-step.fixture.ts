/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreateProcessStepDto } from '@h2-trust/contracts/dtos';
import { RfnboType } from '@h2-trust/domain';
import { CreateQualityDetailsDtoFixture } from './create-quality-details.fixture';

export const CreateProcessStepDtoFixture = {
  create: (overrides: Partial<CreateProcessStepDto> = {}): CreateProcessStepDto => ({
    predecessorUnitIds: [],
    qualityDetails: overrides.qualityDetails ?? CreateQualityDetailsDtoFixture.create(),
    amount: overrides.amount ?? 1,
    recipient: overrides.recipient ?? 'company-recipient-1',
    filledAt: overrides.filledAt ?? '2025-04-07T00:00:00.000Z',
    recordedBy: overrides.recordedBy ?? 'user-id-1',
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
    file: overrides.file,
    distance: overrides.distance ?? 1000,
  }),
} as const;
