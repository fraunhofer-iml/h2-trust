/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementConnectionDto } from '@h2-trust/contracts/dtos';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export const PowerPurchaseAgreementConnectionDtoFixture = {
  create: (overrides: Partial<PowerPurchaseAgreementConnectionDto> = {}): PowerPurchaseAgreementConnectionDto => ({
    powerPurchaseAgreementStatus: overrides.powerPurchaseAgreementStatus ?? PowerPurchaseAgreementStatus.PENDING,
    powerProducerId: overrides.powerProducerId ?? 'company-power-1',
  }),
} as const;