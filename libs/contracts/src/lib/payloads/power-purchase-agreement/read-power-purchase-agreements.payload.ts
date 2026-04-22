/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';

export class ReadPowerPurchaseAgreementsPayload {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsOptional()
  @IsEnum(PpaRequestRole)
  powerPurchaseAgreementRole?: PpaRequestRole;

  @IsEnum(PowerPurchaseAgreementStatus)
  @IsOptional()
  powerPurchaseAgreementStatus?: PowerPurchaseAgreementStatus;

  constructor(userId: string, ppaRole?: PpaRequestRole, powerPurchaseAgreementStatus?: PowerPurchaseAgreementStatus) {
    this.userId = userId;
    this.powerPurchaseAgreementRole = ppaRole;
    this.powerPurchaseAgreementStatus = powerPurchaseAgreementStatus;
  }
}
