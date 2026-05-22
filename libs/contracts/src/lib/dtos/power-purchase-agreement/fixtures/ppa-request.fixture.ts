/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaRequestDto } from '@h2-trust/contracts/dtos';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDtoFixture } from '../../company/fixtures';
import { PowerProductionOverviewDtoFixture } from '../../unit/fixtures';
import { UserDetailsDtoFixture } from '../../user/fixtures';

export const PpaRequestDtoFixture = {
  create: (overrides: Partial<PpaRequestDto> = {}): PpaRequestDto => ({
    id: overrides.id ?? 'ppa-request-1',
    createdAt: overrides.createdAt ?? new Date('2026-05-20T10:00:00.000Z'),
    status: overrides.status ?? PowerPurchaseAgreementStatus.PENDING,
    validFrom: overrides.validFrom ?? new Date('2026-06-01T00:00:00.000Z'),
    validTo: overrides.validTo ?? new Date('2026-12-31T00:00:00.000Z'),
    sender: overrides.sender ?? UserDetailsDtoFixture.create(),
    receiver: overrides.receiver ?? CompanyDtoFixture.create(),
    powerProductionType: overrides.powerProductionType ?? PowerProductionType.WIND_TURBINE,
    powerProductionUnit: overrides.powerProductionUnit ?? PowerProductionOverviewDtoFixture.create(),
    decidedAt: overrides.decidedAt,
    decidedBy: overrides.decidedBy,
    comment: overrides.comment,
  }),
  createApproved: (overrides: Partial<PpaRequestDto> = {}): PpaRequestDto =>
    PpaRequestDtoFixture.create({
      ...overrides,
      status: overrides.status ?? PowerPurchaseAgreementStatus.APPROVED,
      decidedAt: overrides.decidedAt ?? new Date('2026-05-21T10:00:00.000Z'),
      decidedBy: overrides.decidedBy ?? 'approver-id-1',
    }),
} as const;
