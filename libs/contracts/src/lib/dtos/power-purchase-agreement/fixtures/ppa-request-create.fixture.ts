/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaRequestCreateDto } from '@h2-trust/contracts/dtos';
import { PowerProductionType } from '@h2-trust/domain';

export const PpaRequestCreateDtoFixture = {
  create: (overrides: Partial<PpaRequestCreateDto> = {}): PpaRequestCreateDto => ({
    companyId: overrides.companyId ?? 'company-power-1',
    powerProductionType: overrides.powerProductionType ?? PowerProductionType.WIND_OFFSHORE,
    validFrom: overrides.validFrom ?? new Date('2026-06-01T00:00:00.000Z'),
    validTo: overrides.validTo ?? new Date('2026-12-31T00:00:00.000Z'),
  }),
} as const;