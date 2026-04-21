/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PowerAccessApprovalEntity, PowerProductionUnitEntity } from '@h2-trust/contracts/entities';
import { ReadByIdPayload, ReadPowerAccessApprovalsPayload } from '@h2-trust/contracts/payloads';
import { PowerAccessApprovalMessagePatterns } from '@h2-trust/messaging';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller()
export class PowerAccessApprovalController {
  constructor(private readonly service: PowerAccessApprovalService) {}

  @MessagePattern(PowerAccessApprovalMessagePatterns.READ)
  async findAll(payload: ReadPowerAccessApprovalsPayload): Promise<PowerAccessApprovalEntity[]> {
    return this.service.findAll(payload);
  }

  @MessagePattern(PowerAccessApprovalMessagePatterns.READ_APPROVED_GRID_POWER_PRODUCTION_UNIT_BY_USER_ID)
  async readApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    return this.service.findApprovedGridPowerProductionUnitByUserId(payload);
  }
}
