/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementEntity } from '@h2-trust/contracts/entities';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';
import { PowerProductionUnitEntityFixture } from '../../unit/fixtures/power-production-unit.fixture';
import { UserEntityFixture } from '../../user/fixtures/user.fixture';

export const PowerPurchaseAgreementEntityFixture = {
  create: (overrides: Partial<PowerPurchaseAgreementEntity> = {}): PowerPurchaseAgreementEntity =>
    new PowerPurchaseAgreementEntity(
      overrides.id ?? 'ppa-id-1',
      overrides.createdAt ?? new Date('2025-01-01'),
      overrides.validFrom ?? new Date('2025-01-01'),
      overrides.validTo ?? new Date('2025-12-31'),
      overrides.status ?? PowerPurchaseAgreementStatus.APPROVED,
      overrides.requestedCompany ?? CompanyEntityFixture.createPowerProducer(),
      overrides.hydrogenProducer ?? CompanyEntityFixture.createHydrogenProducer(),
      overrides.suggestedPowerProductionTypeName ?? 'SOLAR',
      overrides.creator ?? UserEntityFixture.createHydrogenUser(),
      overrides.powerProductionUnit ?? PowerProductionUnitEntityFixture.create(),
      overrides.decision,
    ),
} as const;
