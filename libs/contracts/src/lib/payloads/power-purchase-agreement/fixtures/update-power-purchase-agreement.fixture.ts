/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UpdatePowerPurchaseAgreementPayload } from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export const UpdatePowerPurchaseAgreementPayloadFixture = {
  create: (overrides: Partial<UpdatePowerPurchaseAgreementPayload> = {}): UpdatePowerPurchaseAgreementPayload =>
    new UpdatePowerPurchaseAgreementPayload(
      overrides.ppaId ?? 'ppa-1',
      overrides.decision ?? PowerPurchaseAgreementStatus.APPROVED,
      overrides.decidingUserId ?? 'user-2',
      overrides.powerProductionUnitId ?? 'power-production-unit-1',
      overrides.comment ?? 'Approved for fixture use',
    ),
} as const;
