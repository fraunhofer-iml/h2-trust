/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaDto } from '@h2-trust/contracts/dtos';
import { PowerProductionType, PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyDtoFixture } from '../../company/fixtures';
import { PowerProductionOverviewDtoFixture } from '../../unit/fixtures';

export const PpaDtoFixture = {
  create: (overrides: Partial<PpaDto> = {}): PpaDto => ({
    id: overrides.id ?? 'ppa-1',
    hydrogenProducer: overrides.hydrogenProducer ?? CompanyDtoFixture.createHydrogenProducer(),
    powerProducer: overrides.powerProducer ?? CompanyDtoFixture.create(),
    status: overrides.status ?? PowerPurchaseAgreementStatus.PENDING,
    powerProductionType: overrides.powerProductionType ?? PowerProductionType.WIND_TURBINE,
    powerProductionUnit: overrides.powerProductionUnit ?? PowerProductionOverviewDtoFixture.create(),
  }),
  createApproved: (overrides: Partial<PpaDto> = {}): PpaDto =>
    PpaDtoFixture.create({
      ...overrides,
      status: overrides.status ?? PowerPurchaseAgreementStatus.APPROVED,
    }),
} as const;
