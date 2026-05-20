/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaRequestDecisionDto } from '@h2-trust/contracts/dtos';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export const PpaRequestDecisionDtoFixture = {
  create: (overrides: Partial<PpaRequestDecisionDto> = {}): PpaRequestDecisionDto => ({
    decision: overrides.decision ?? PowerPurchaseAgreementStatus.APPROVED,
    powerProductionUnitId: overrides.powerProductionUnitId ?? 'power-production-unit-1',
    comment: overrides.comment ?? 'Fixture decision',
  }),
  createRejected: (overrides: Partial<PpaRequestDecisionDto> = {}): PpaRequestDecisionDto =>
    PpaRequestDecisionDtoFixture.create({
      ...overrides,
      decision: overrides.decision ?? PowerPurchaseAgreementStatus.REJECTED,
      powerProductionUnitId: overrides.powerProductionUnitId ?? undefined,
    }),
} as const;
