/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { BatchRepository, ProcessStepRepository } from '@h2-trust/database';

@Injectable()
export class TransportationService {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly processStepRepository: ProcessStepRepository,
  ) {}

  async createHydrogenTransportationProcessStep(processStepEntity: ProcessStepEntity): Promise<ProcessStepEntity> {
    const transportationProcessStepEntity: ProcessStepEntity = {
      ...processStepEntity,
      processType: ProcessType.HYDROGEN_TRANSPORTATION,
      batch: {
        ...processStepEntity.batch,
        predecessors: [
          {
            id: processStepEntity.batch.id,
          },
        ],
      },
      transportationDetails: processStepEntity.transportationDetails,
    };

    await this.batchRepository.setBatchesInactive([processStepEntity.batch.id]);
    return this.processStepRepository.insertProcessStep(transportationProcessStepEntity);
  }
}
