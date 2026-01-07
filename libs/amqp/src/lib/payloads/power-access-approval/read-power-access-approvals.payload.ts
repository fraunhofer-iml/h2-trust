/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';

export class ReadPowerAccessApprovalsPayload {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(PowerAccessApprovalStatus)
  powerAccessApprovalStatus: PowerAccessApprovalStatus;

  constructor(userId: string, powerAccessApprovalStatus: PowerAccessApprovalStatus) {
    this.userId = userId;
    this.powerAccessApprovalStatus = powerAccessApprovalStatus;
  }
}
