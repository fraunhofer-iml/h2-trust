/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export class PowerPurchaseAgreementConnectionDto {
  powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus;
  powerProducerId: string;

  constructor(powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus, powerProducerId: string) {
    this.powerPurchaseAgreementStatus = powerPurchaseAgreementStatus;
    this.powerProducerId = powerProducerId;
  }
}
