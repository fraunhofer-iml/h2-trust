/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PowerAccessApprovalEntity, PowerAccessApprovalPatterns, ReadPowerAccessApprovalsPayload } from '@h2-trust/amqp';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller()
export class PowerAccessApprovalController {
  constructor(private readonly service: PowerAccessApprovalService) { }

  @MessagePattern(PowerAccessApprovalPatterns.READ)
  async findAll(@Payload() payload: ReadPowerAccessApprovalsPayload): Promise<PowerAccessApprovalEntity[]> {
    return this.service.findAll(payload);
  }
}
