/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerAccessApprovalStatus, PowerProductionType } from '@h2-trust/domain';
import { PowerProductionOverviewDto } from '../unit';
import { UserDetailsDto } from '../user';

export class PpaRequestDto {
  id: string;
  timestamp: string;
  sender: UserDetailsDto;
  receiver: UserDetailsDto;
  powerProductionType: PowerProductionType;
  powerProductionUnit?: PowerProductionOverviewDto;
  status: PowerAccessApprovalStatus;
  comment?: string;

  constructor(
    id: string,
    timestammp: string,
    sender: UserDetailsDto,
    receiver: UserDetailsDto,
    powerType: PowerProductionType,
    powerProductionUnit: PowerProductionOverviewDto,
    status: PowerAccessApprovalStatus,
    comment?: string,
  ) {
    this.id = id;
    this.timestamp = timestammp;
    this.sender = sender;
    this.receiver = receiver;
    this.powerProductionType = powerType;
    this.powerProductionUnit = powerProductionUnit;
    this.status = status;
    this.comment = comment;
  }
}
