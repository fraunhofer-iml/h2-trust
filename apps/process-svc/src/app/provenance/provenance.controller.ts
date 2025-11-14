/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProvenanceEntity, LineageMessagePatterns } from '@h2-trust/amqp';
import { ProvenanceService } from './provenance.service';

@Controller()
export class ProvenanceController {
  constructor(private readonly service: ProvenanceService) { }

  @MessagePattern(LineageMessagePatterns.BUILD_CONTEXT)
  async buildProvenance(@Payload() payload: { processStepId: string }): Promise<ProvenanceEntity> {
    return this.service.buildProvenance(payload.processStepId);
  }
}
