/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsIn, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';

export type DecisionStatus = PowerAccessApprovalStatus.APPROVED | PowerAccessApprovalStatus.REJECTED;

export class PpaRequestDecisionDto {
  @IsNotEmpty()
  @IsIn([PowerAccessApprovalStatus.APPROVED, PowerAccessApprovalStatus.REJECTED])
  decision: PowerAccessApprovalStatus.APPROVED | PowerAccessApprovalStatus.REJECTED;

  @ValidateIf((dto) => dto.decision === PowerAccessApprovalStatus.APPROVED)
  @IsString()
  @IsNotEmpty({ message: 'Unit is required when approving' })
  powerProductionUnitId?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  comment?: string;

  constructor(
    decision: PowerAccessApprovalStatus.APPROVED | PowerAccessApprovalStatus.REJECTED,
    powerProductionUnitId?: string,
    comment?: string,
  ) {
    this.decision = decision;
    this.powerProductionUnitId = powerProductionUnitId;
    this.comment = comment;
  }
}
