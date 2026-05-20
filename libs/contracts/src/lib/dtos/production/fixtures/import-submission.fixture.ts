/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { StagingSubmissionDto } from '@h2-trust/contracts/dtos';

export const StagingSubmissionDtoFixture = {
  create: (overrides: Partial<StagingSubmissionDto> = {}): StagingSubmissionDto => ({
    stagedHydrogenProduction: overrides.stagedHydrogenProduction ?? 'staged-hydrogen-1',
    stagedPowerProductions: overrides.stagedPowerProductions ?? ['staged-power-1'],
    storageUnitId: overrides.storageUnitId ?? 'hydrogen-storage-unit-1',
  }),
} as const;
