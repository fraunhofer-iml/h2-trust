/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';
import { CompanyDto } from '../company';
import { PowerProductionOverviewDto } from '../unit';
import { UserDetailsDto } from '../user';

export class PpaRequestDto {
  id: string;
  createdAt: Date;
  decidedAt?: Date;
  decidedBy?: string;
  validFrom: Date;
  validTo: Date;
  sender: UserDetailsDto;
  receiver: CompanyDto;
  powerProductionType: PowerProductionType;
  powerProductionUnit?: PowerProductionOverviewDto;
  status: PowerAccessApprovalStatus;
  comment?: string;

  constructor(
    id: string,
    createdAt: Date,
    validFrom: Date,
    validTo: Date,
    sender: UserDetailsDto,
    receiver: CompanyDto,
    powerType: PowerProductionType,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerAccessApprovalStatus,
    decidedAt?: Date,
    decidedBy?: string,
    comment?: string,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.decidedAt = decidedAt;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.sender = sender;
    this.receiver = receiver;
    this.powerProductionType = powerType;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.decidedBy = decidedBy;
    this.decidedAt = decidedAt;
    this.comment = comment;
  }
}
