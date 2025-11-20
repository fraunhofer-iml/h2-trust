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
  BatchEntity,
  HydrogenComponentEntity,
  ProcessStepEntity,
  ProcessStepMessagePatterns,
  TransportationDetailsEntity,
} from '@h2-trust/amqp';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepService } from './process-step.service';
import 'multer';
import { ProcessType } from '@h2-trust/domain';
import { TransportationService } from './transportation.service';

@Controller()
export class ProcessStepController {
  constructor(
    private readonly processStepService: ProcessStepService,
    private readonly bottlingService: BottlingService,
    private readonly transportationService: TransportationService,
  ) {}

  @MessagePattern(ProcessStepMessagePatterns.READ_ALL)
  async readProcessSteps(
    @Payload()
    payload: {
      processTypes: ProcessType[];
      predecessorProcessTypes: string[];
      active: boolean;
      companyId: string;
    },
  ): Promise<ProcessStepEntity[]> {
    return this.processStepService.readProcessSteps(
      payload.processTypes,
      payload.predecessorProcessTypes,
      payload.active,
      payload.companyId,
    );
  }

  @MessagePattern(ProcessStepMessagePatterns.READ_UNIQUE)
  async readProcessStep(@Payload() payload: { processStepId: string }): Promise<ProcessStepEntity> {
    return this.processStepService.readProcessStep(payload.processStepId);
  }

  @MessagePattern(ProcessStepMessagePatterns.CREATE)
  async createProcessStep(@Payload() payload: { processStepEntity: ProcessStepEntity }): Promise<ProcessStepEntity> {
    return this.processStepService.createProcessStep(payload.processStepEntity);
  }

  @MessagePattern(ProcessStepMessagePatterns.HYDROGEN_BOTTLING)
  async createHydrogenBottlingProcessStep(
    @Payload() payload: { processStepEntity: ProcessStepEntity; files: Express.Multer.File[] },
  ): Promise<ProcessStepEntity> {
    return this.bottlingService.createHydrogenBottlingProcessStep(payload.processStepEntity, payload.files);
  }

  @MessagePattern(ProcessStepMessagePatterns.HYDROGEN_TRANSPORTATION)
  async createHydrogenTransportationProcessStep(
    @Payload()
    payload: {
      processStepEntity: ProcessStepEntity;
      predecessorBatch: BatchEntity;
      transportationDetails: TransportationDetailsEntity;
    },
  ): Promise<ProcessStepEntity> {
    return this.transportationService.createHydrogenTransportationProcessStep(
      payload.processStepEntity,
      payload.predecessorBatch,
      payload.transportationDetails,
    );
  }

  @MessagePattern(ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION)
  async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenComponentEntity[]> {
    return this.bottlingService.calculateHydrogenComposition(bottlingProcessStepId);
  }
}
