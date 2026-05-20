/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccountingPeriodMatchingResultDto } from '@h2-trust/contracts/dtos';

export const AccountingPeriodMatchingResultDtoFixture = {
  create: (overrides: Partial<AccountingPeriodMatchingResultDto> = {}): AccountingPeriodMatchingResultDto => ({
    id: overrides.id ?? 'staging-result-1',
    powerUsed: overrides.powerUsed ?? 120,
    hydrogenProduced: overrides.hydrogenProduced ?? 10,
    numberOfBatches: overrides.numberOfBatches ?? 2,
  }),
} as const;