/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateHydrogenBottlingPayload, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { BottlingService } from './bottling.service';

@Controller()
export class BottlingController {
  constructor(private readonly bottlingService: BottlingService) {}

  @MessagePattern(ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING)
  async createHydrogenBottlingProcessStep(payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    return this.bottlingService.createHydrogenBottlingProcessStep(payload);
  }
}
