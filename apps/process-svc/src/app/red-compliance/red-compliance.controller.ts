/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RedComplianceService } from './red-compliance.service';
import { ReadByIdPayload, RedComplianceEntity, RedComplianceMessagePatterns } from '@h2-trust/amqp';

@Controller()
export class RedComplianceController {
  constructor(private readonly service: RedComplianceService) {}

  @MessagePattern(RedComplianceMessagePatterns.DETERMINE)
  async determineRedCompliance(@Payload() payload: ReadByIdPayload): Promise<RedComplianceEntity> {
    return this.service.determineRedCompliance(payload);
  }
}
