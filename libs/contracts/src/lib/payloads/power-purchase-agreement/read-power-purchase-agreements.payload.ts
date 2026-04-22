/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export class ReadPowerPurchaseAgreementsPayload {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(PowerPurchaseAgreementStatus)
  @IsNotEmpty()
  powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus;

  constructor(userId: string, powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus) {
    this.userId = userId;
    this.powerPurchaseAgreementStatus = powerPurchaseAgreementStatus;
  }
}
