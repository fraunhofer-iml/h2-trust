/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { CreatePowerPurchaseAgreementsPayload } from '@h2-trust/amqp';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export function buildPowerPurchaseCreateInput(
  payload: CreatePowerPurchaseAgreementsPayload,
): Prisma.PowerPurchaseAgreementCreateInput {
  return; /* Prisma.validator<Prisma.PowerPurchaseAgreementCreateInput>()({status:PowerPurchaseAgreementStatus.PENDING,hydrogenProducer:payload.
  }); */
}
