/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepOverviewDto } from '@h2-trust/contracts/dtos';
import { RfnboType } from '@h2-trust/domain';

export const BottlingOverviewDtoFixture = {
  create: (overrides: Partial<ProcessStepOverviewDto> = {}): ProcessStepOverviewDto => ({
    id: overrides.id ?? 'bottling-1',
    filledAt: overrides.filledAt ?? new Date('2025-04-07T00:00:00.000Z'),
    owner: overrides.owner ?? 'PowerGen AG',
    filledAmount: overrides.filledAmount ?? 1,
    rfnboType: overrides.rfnboType ?? RfnboType.RFNBO_READY,
  }),
} as const;
