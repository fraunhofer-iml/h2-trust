/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreatePowerPurchaseAgreementsPayload } from '@h2-trust/contracts/payloads';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export function buildPowerPurchaseAgreementCreateData(
  ppa: CreatePowerPurchaseAgreementsPayload,
  hydrogenProducerCompanyId: string,
) {
  return {
    createdAt: new Date(),
    validTo: ppa.validTo,
    validFrom: ppa.validFrom,
    status: PowerPurchaseAgreementStatus.PENDING,
    suggestedPowerType: {
      connect: {
        name: ppa.powerProductionType,
      },
    },
    hydrogenProducer: {
      connect: {
        id: hydrogenProducerCompanyId,
      },
    },
    creatingUser: {
      connect: { id: ppa.userId },
    },
    powerProducer: {
      connect: { id: ppa.companyId },
    },
  };
}
