/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { BatchEntity, ProcessStepEntity, TransportationDetailsEntity } from '@h2-trust/amqp';
import { BatchRepository, ProcessStepRepository } from '@h2-trust/database';
import { BatchType, ProcessType } from '@h2-trust/domain';

@Injectable()
export class TransportationService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly processStepRepository: ProcessStepRepository,
  ) {}

  async createHydrogenTransportationProcessStep(
    processStepEntity: ProcessStepEntity,
    predecessorBatch: BatchEntity,
    transportationDetails: TransportationDetailsEntity,
  ): Promise<ProcessStepEntity> {
    const transportationProcessStepEntity: ProcessStepEntity = {
      ...processStepEntity,
      type: ProcessType.HYDROGEN_TRANSPORTATION,
      batch: {
        ...processStepEntity.batch,
        type: BatchType.HYDROGEN,
        predecessors: [predecessorBatch],
      },
      transportationDetails: transportationDetails,
    };

    await this.batchRepository.setBatchesInactive([predecessorBatch.id]);
    return this.processStepRepository.insertProcessStep(transportationProcessStepEntity);
  }
}
