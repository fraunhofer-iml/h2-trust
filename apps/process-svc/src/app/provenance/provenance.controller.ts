/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import * as amqp from '@h2-trust/amqp';
import {ProvenanceService} from './provenance.service';
import {GraphBuilderService} from './graph-builder.service';

@Controller()
export class ProvenanceController {
  constructor(private readonly service: ProvenanceService, private readonly graphBuilder: GraphBuilderService) {
  }

  @MessagePattern(amqp.ProvenanceMessagePatterns.BUILD_PROVENANCE)
  async buildProvenance(@Payload() payload: { processStepId: string }): Promise<amqp.ProvenanceEntity> {
    return this.service.buildProvenance(payload.processStepId);
  }

  @MessagePattern(amqp.ProvenanceMessagePatterns.BUILD_GRAPH)
  async buildGraph(@Payload() payload: amqp.BuildGraphParamsDto): Promise<amqp.ProvenanceGraphDto> {
    return this.graphBuilder.buildGraph(payload);
  }
}
