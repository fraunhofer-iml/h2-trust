/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';

export class UpdatePowerPurchaseAgreementPayload {
  @IsString()
  @IsNotEmpty()
  ppaId: string;

  @IsNotEmpty()
  @IsIn([PowerPurchaseAgreementStatus.APPROVED, PowerPurchaseAgreementStatus.REJECTED])
  decision: PowerPurchaseAgreementStatus.APPROVED | PowerPurchaseAgreementStatus.REJECTED;

  @IsString()
  @IsNotEmpty()
  decidingUserId: string;

  @ValidateIf((dto) => dto.decision === PowerPurchaseAgreementStatus.APPROVED)
  @IsString()
  @IsNotEmpty({ message: 'Unit is required when approving' })
  powerProductionUnitId?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  comment?: string;

  constructor(
    ppaId: string,
    decision: PowerPurchaseAgreementStatus.APPROVED | PowerPurchaseAgreementStatus.REJECTED,
    decidingUserId: string,
    powerProductionUnitId?: string,
    comment?: string,
  ) {
    this.ppaId = ppaId;
    this.decision = decision;
    this.decidingUserId = decidingUserId;
    this.powerProductionUnitId = powerProductionUnitId;
    this.comment = comment;
  }
}
