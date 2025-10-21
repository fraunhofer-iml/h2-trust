/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PowerAccessApprovalEntity, PowerAccessApprovalPattern } from '@h2-trust/amqp';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller()
export class PowerAccessApprovalController {
  constructor(private readonly service: PowerAccessApprovalService) {}

  @MessagePattern(PowerAccessApprovalPattern.READ)
  async findAll(
    @Payload() payload: { userId: string; powerAccessApprovalStatus: PowerAccessApprovalStatus },
  ): Promise<PowerAccessApprovalEntity[]> {
    return this.service.findAll(payload.userId, payload.powerAccessApprovalStatus);
  }
}
