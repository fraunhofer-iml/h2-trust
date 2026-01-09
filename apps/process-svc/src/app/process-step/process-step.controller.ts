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
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
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

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL_BY_PREDECESSOR_TYPES_AND_COMPANY)
  async readProcessStepsByPredecessorTypesAndCompany(
    @Payload() payload: ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessStepsByPredecessorTypesAndCompany(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY)
  async readProcessStepsByTypesAndActiveAndCompany(
    @Payload() payload: ReadProcessStepsByTypesAndActiveAndCompanyPayload,
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessStepsByTypesAndActiveAndCompany(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING)
  async createHydrogenBottlingProcessStep(
    @Payload() payload: CreateHydrogenBottlingPayload,
  ): Promise<ProcessStepEntity> {
    return this.bottlingService.createHydrogenBottlingProcessStep(payload);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION)
  async createHydrogenTransportationProcessStep(
    @Payload() payload: CreateHydrogenTransportationPayload,
  ): Promise<ProcessStepEntity> {
    return this.transportationService.createHydrogenTransportationProcessStep(payload);
  }
}
