/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { TransportationService } from './transportation.service';
import { CreateHydrogenTransportationPayload, ProcessStepEntity } from '@h2-trust/contracts';

@Controller()
export class TransportationController {
  constructor(private readonly transportationService: TransportationService) {}

  @MessagePattern(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION)
  async createHydrogenTransportationProcessStep(
    payload: CreateHydrogenTransportationPayload,
  ): Promise<ProcessStepEntity> {
    return this.transportationService.createHydrogenTransportationProcessStep(payload);
  }
}
