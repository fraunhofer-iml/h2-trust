/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { CreateHydrogenTransportationPayload } from '@h2-trust/contracts/payloads';
import { BatchType, ProcessType } from '@h2-trust/domain';
import { ProcessStepService } from '../process-step/process-step.service';

@Injectable()
export class TransportationService {
  constructor(private readonly processStepService: ProcessStepService) {}

  async createHydrogenTransportationProcessStep(
    payload: CreateHydrogenTransportationPayload,
  ): Promise<ProcessStepEntity> {
    //TODO-LG: add transport emission data here (distance)
    const transportation: ProcessStepEntity = {
      ...payload.processStep,
      type: ProcessType.HYDROGEN_TRANSPORTATION,
      batch: {
        ...payload.processStep.batch,
        type: BatchType.HYDROGEN,
        predecessors: [payload.predecessorBatch],
      },
    };

    await this.processStepService.setBatchesInactive([payload.predecessorBatch.id]);
    return this.processStepService.createProcessStep(transportation);
  }
}
