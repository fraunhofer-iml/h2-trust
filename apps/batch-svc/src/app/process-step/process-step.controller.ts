/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateHydrogenBottlingPayload,
  CreateHydrogenTransportationPayload,
  CreateManyProcessStepsPayload,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ReadByIdPayload,
  ReadProcessStepsPayload,
} from '@h2-trust/amqp';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepService } from './process-step.service';
import 'multer';
import { TransportationService } from './transportation.service';

@Controller()
export class ProcessStepController {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly transportationService: TransportationService,
  ) { }

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(@Payload() payload: ReadProcessStepsPayload): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessSteps(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_UNIQUE)
  async readProcessStep(@Payload() payload: ReadByIdPayload): Promise<ProcessStepEntity> {
    return this.processStepService.readProcessStep(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE_MANY)
  async createManyProcessSteps(@Payload() payload: CreateManyProcessStepsPayload): Promise<ProcessStepEntity[]> {
    return this.processStepService.createManyProcessSteps(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING)
  async createHydrogenBottlingProcessStep(@Payload() payload: CreateHydrogenBottlingPayload): Promise<ProcessStepEntity> {
    return this.bottlingService.createHydrogenBottlingProcessStep(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION)
  async createHydrogenTransportationProcessStep(@Payload() payload: CreateHydrogenTransportationPayload): Promise<ProcessStepEntity> {
    return this.transportationService.createHydrogenTransportationProcessStep(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION)
  async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenComponentEntity[]> {
    return this.bottlingService.calculateHydrogenComposition(bottlingProcessStepId);
  }
}
