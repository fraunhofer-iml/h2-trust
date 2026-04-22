/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export type DecisionStatus = PowerPurchaseAgreementStatus.APPROVED | PowerPurchaseAgreementStatus.REJECTED;

export class PpaRequestDecisionDto {
  @IsNotEmpty()
  @IsIn([PowerPurchaseAgreementStatus.APPROVED, PowerPurchaseAgreementStatus.REJECTED])
  decision: PowerPurchaseAgreementStatus.APPROVED | PowerPurchaseAgreementStatus.REJECTED;

  @ValidateIf((dto) => dto.decision === PowerPurchaseAgreementStatus.APPROVED)
  @IsString()
  @IsNotEmpty({ message: 'Unit is required when approving' })
  powerProductionUnitId?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  comment?: string;

  constructor(
    decision: PowerPurchaseAgreementStatus.APPROVED | PowerPurchaseAgreementStatus.REJECTED,
    powerProductionUnitId?: string,
    comment?: string,
  ) {
    this.decision = decision;
    this.powerProductionUnitId = powerProductionUnitId;
    this.comment = comment;
  }

  
}
