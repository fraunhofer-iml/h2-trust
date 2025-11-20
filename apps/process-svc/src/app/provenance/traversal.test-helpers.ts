/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { BatchEntity, BrokerQueues, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';

export function createProcessStep(id: string, type: ProcessType, predecessorBatches: BatchEntity[]): ProcessStepEntity {
  return { id, type, batch: { predecessors: predecessorBatches } } as ProcessStepEntity;
}

export function createBatch(processStepId: string): BatchEntity {
  return { processStepId } as BatchEntity;
}

export async function setupTraversalServiceTestingModule(): Promise<{
  service: TraversalService;
  batchSvcSendMock: jest.Mock;
}> {
  const batchSvcSendMock = jest.fn();

  const moduleRef = await Test.createTestingModule({
    providers: [TraversalService, { provide: BrokerQueues.QUEUE_BATCH_SVC, useValue: { send: batchSvcSendMock } }],
  }).compile();

  const service = moduleRef.get(TraversalService);
  return { service, batchSvcSendMock };
}
