/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export class DecisionDto {
  id: string;
  status: PowerPurchaseAgreementStatus;
  decidedAt: Date;
  comment: string;
  powerProductionUnitId: string;
  authorizingUser: string;
  grantedPowerProductionUnitId: string;

  constructor(
    id: string,
    status: PowerPurchaseAgreementStatus,
    decidedAt: Date,
    comment: string,
    powerProductionUnitId: string,
    authorizingUser: string,
    grantedPowerProductionUnitId: string,
  ) {
    this.id = id;
    this.status = status;
    this.decidedAt = decidedAt;
    this.comment = comment;
    this.powerProductionUnitId = powerProductionUnitId;
    this.authorizingUser = authorizingUser;
    this.grantedPowerProductionUnitId = grantedPowerProductionUnitId;
  }
}
