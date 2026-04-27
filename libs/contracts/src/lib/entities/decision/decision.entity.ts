/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecisionDbType } from '@h2-trust/database';

export class DecisionEntity {
  id: string;
  decidedAt: Date;
  powerPurchaseAgreementId: string;
  decidingUserId: string;
  grantedPowerProductionUnitId: string;

  constructor(
    id: string,
    decidedAt: Date,
    powerPurchaseAgreementId: string,
    decidingUserId: string,
    grantedPowerProductionUnitId: string,
  ) {
    this.id = id;
    this.decidedAt = decidedAt;
    this.powerPurchaseAgreementId = powerPurchaseAgreementId;
    this.decidingUserId = decidingUserId;
    this.grantedPowerProductionUnitId = grantedPowerProductionUnitId;
  }

  static fromDatabase(decision: DecisionDbType) {
    return <DecisionEntity>{
      id: decision.id,
      decidedAt: decision.decidedAt,
      powerPurchaseAgreementId: decision.powerPurchaseAgreementId,
      decidingUserId: decision.userId,
      grantedPowerProductionUnitId: decision.powerPurchaseAgreementId,
    };
  }
}
