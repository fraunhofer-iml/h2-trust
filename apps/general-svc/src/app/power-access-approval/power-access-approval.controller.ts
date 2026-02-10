/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  PowerAccessApprovalEntity,
  PowerAccessApprovalPatterns,
  PowerProductionUnitEntity,
  ReadByIdPayload,
  ReadPowerAccessApprovalsPayload,
} from '@h2-trust/amqp';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller()
export class PowerAccessApprovalController {
  constructor(private readonly service: PowerAccessApprovalService) { }

  @MessagePattern(PowerAccessApprovalPatterns.READ)
  async findAll(payload: ReadPowerAccessApprovalsPayload): Promise<PowerAccessApprovalEntity[]> {
    return this.service.findAll(payload);
  }

  @MessagePattern(PowerAccessApprovalPatterns.READ_APPROVED_GRID_POWER_PRODUCTION_UNIT_BY_USER_ID)
  async readApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    return this.service.findApprovedGridPowerProductionUnitByUserId(payload);
  }
}
