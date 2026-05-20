/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadPowerPurchaseAgreementsPayload } from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';

export const ReadPowerPurchaseAgreementsPayloadFixture = {
  create: (overrides: Partial<ReadPowerPurchaseAgreementsPayload> = {}): ReadPowerPurchaseAgreementsPayload =>
    new ReadPowerPurchaseAgreementsPayload(
      overrides.userId ?? 'user-1',
      overrides.powerPurchaseAgreementRole ?? PpaRequestRole.REQUESTER,
      overrides.powerPurchaseAgreementStatus ?? PowerPurchaseAgreementStatus.PENDING,
    ),
} as const;
