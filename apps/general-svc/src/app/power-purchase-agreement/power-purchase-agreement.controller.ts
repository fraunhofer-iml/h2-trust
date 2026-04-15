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
  PowerAccessApprovalPatterns,
  PowerProductionUnitEntity,
  PowerPurchaseAgreementEntity,
  ReadByIdPayload,
  ReadPowerAccessApprovalsPayload,
} from '@h2-trust/amqp';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

@Controller()
export class PowerPurchaseAgreementController {
  constructor(private readonly service: PowerPurchaseAgreementService) {}

  @MessagePattern(PowerAccessApprovalPatterns.READ)
  async findAll(payload: ReadPowerAccessApprovalsPayload): Promise<PowerPurchaseAgreementEntity[]> {
    return this.service.findAll(payload);
  }

  @MessagePattern(PowerAccessApprovalPatterns.READ_APPROVED_GRID_POWER_PRODUCTION_UNIT_BY_USER_ID)
  async readApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    return this.service.findApprovedGridPowerProductionUnitByUserId(payload);
  }
}
