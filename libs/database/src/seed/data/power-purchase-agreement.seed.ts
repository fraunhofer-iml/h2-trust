/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreement } from '@prisma/client';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { auditTimestamp } from './audit-timestamp.constant';
import { CompanySeed } from './company.seed';
import { PowerProductionUnitSeed } from './unit';
import { UserSeed } from './user.seed';

export const PowerPurchaseAgreementSeed: readonly PowerPurchaseAgreement[] = Object.freeze([
  {
    id: 'power-purchase-agreement-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    validFrom: new Date('2025-02-01'),
    validTo: new Date('2025-02-14'),
    status: PowerPurchaseAgreementStatus.APPROVED,
    requestingUserId: UserSeed[0].id,
    requestedCompanyId: CompanySeed[0].id,
    powerProductionUnitId: PowerProductionUnitSeed[0].id,
    hydrogenProducerId: CompanySeed[2].id,
  },
  {
    id: 'power-purchase-agreement-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    validFrom: new Date('2025-02-01'),
    validTo: new Date('2025-02-14'),
    status: PowerPurchaseAgreementStatus.APPROVED,
    requestingUserId: UserSeed[0].id,
    requestedCompanyId: CompanySeed[2].id,
    powerProductionUnitId: PowerProductionUnitSeed[1].id,
    hydrogenProducerId: CompanySeed[2].id,
  },
  {
    id: 'power-purchase-agreement-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    validFrom: new Date('2025-08-01'),
    validTo: new Date('2025-08-16'),
    status: PowerPurchaseAgreementStatus.APPROVED,
    requestingUserId: UserSeed[0].id,
    requestedCompanyId: CompanySeed[2].id,
    powerProductionUnitId: PowerProductionUnitSeed[2].id,
    hydrogenProducerId: CompanySeed[2].id,
  },
  {
    id: 'power-purchase-agreement-3',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    validFrom: new Date('2025-08-01'),
    validTo: new Date('2025-08-16'),
    status: PowerPurchaseAgreementStatus.APPROVED,
    requestingUserId: UserSeed[0].id,
    requestedCompanyId: CompanySeed[1].id,
    powerProductionUnitId: PowerProductionUnitSeed[3].id,
    hydrogenProducerId: CompanySeed[2].id,
  },
]);
