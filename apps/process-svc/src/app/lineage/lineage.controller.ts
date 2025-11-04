/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LineageContextEntity, LineageMessagePatterns } from '@h2-trust/amqp';
import { LineageContextService } from './lineage-context.service';

@Controller()
export class LineageController {
  constructor(private readonly contextService: LineageContextService) {}

  @MessagePattern(LineageMessagePatterns.BUILD_CONTEXT)
  async buildContext(@Payload() payload: { processStepId: string }): Promise<LineageContextEntity> {
    return this.contextService.build(payload.processStepId);
  }
}
