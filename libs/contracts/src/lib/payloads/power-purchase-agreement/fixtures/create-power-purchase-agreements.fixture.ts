/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreatePowerPurchaseAgreementsPayload } from '@h2-trust/contracts/payloads';
import { PowerProductionType } from '@h2-trust/domain';

export const CreatePowerPurchaseAgreementsPayloadFixture = {
  create: (overrides: Partial<CreatePowerPurchaseAgreementsPayload> = {}): CreatePowerPurchaseAgreementsPayload =>
    new CreatePowerPurchaseAgreementsPayload(
      overrides.companyId ?? 'company-1',
      overrides.powerProductionType ?? PowerProductionType.SOLAR,
      overrides.validFrom ?? new Date('2026-01-01T00:00:00Z'),
      overrides.validTo ?? new Date('2026-12-31T23:59:59Z'),
      overrides.userId ?? 'user-1',
    ),
} as const;
