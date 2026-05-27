/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementDecision } from '@prisma/client';
import { auditTimestamp } from './audit-timestamp.constant';
import { PowerPurchaseAgreementSeed } from './power-purchase-agreement.seed';
import { UnitSpecificationSeed } from './unit';
import { UserSeed } from './user.seed';

export const PowerPurchaseAgreementDecisionSeed: readonly PowerPurchaseAgreementDecision[] = Object.freeze([
  {
    id: 'power-purchase-agreement-decision-1',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[0].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: UnitSpecificationSeed[0].id,
  },
  {
    id: 'power-purchase-agreement-decision-2',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[1].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: UnitSpecificationSeed[1].id,
  },
  {
    id: 'power-purchase-agreement-decision-3',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[2].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: UnitSpecificationSeed[2].id,
  },
  {
    id: 'power-purchase-agreement-decision-4',
    decidedAt: auditTimestamp,
    comment: 'Qed',
    powerPurchaseAgreementId: PowerPurchaseAgreementSeed[3].id,
    userId: UserSeed[0].id,
    grantedPowerProductionUnitId: UnitSpecificationSeed[3].id,
  },
]);
