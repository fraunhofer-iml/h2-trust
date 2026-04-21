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
  PowerProductionUnitEntity,
  PowerPurchaseAgreementEntity,
  PowerPurchaseAgreementPatterns,
  ReadByIdPayload,
  ReadPowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/amqp';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

@Controller()
export class PowerPurchaseAgreementController {
  constructor(private readonly service: PowerPurchaseAgreementService) {}

  @MessagePattern(PowerPurchaseAgreementPatterns.READ)
  async findAll(payload: ReadPowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity[]> {
    console.log(payload);
    return this.service.findAll(payload);
  }

  /*  @MessagePattern(PowerPurchaseAgreementPatterns.CREATE)
  async createPPA(payload: CreatePowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity[]> {
    return; this.service.createPPA(payload);
  } */

  @MessagePattern(PowerPurchaseAgreementPatterns.UPDATE)
  async updatePPAStatus(payload: UpdatePowerPurchaseAgreementPayload): Promise<PowerPurchaseAgreementEntity> {
    return this.service.updatePPA(payload);
  }

  @MessagePattern(PowerPurchaseAgreementPatterns.READ_APPROVED_GRID_POWER_PRODUCTION_UNIT_BY_USER_ID)
  async readApprovedGridPowerProductionUnitByUserId(payload: ReadByIdPayload): Promise<PowerProductionUnitEntity> {
    return this.service.findApprovedGridPowerProductionUnitByUserId(payload);
  }
}
