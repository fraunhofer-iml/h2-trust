/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { BatchEntity, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { TraversalService } from './traversal.service';
import { ProcessStepService } from '../../process-step/process-step.service';

export function createProcessStep(id: string, type: ProcessType, predecessorBatches: BatchEntity[]): ProcessStepEntity {
  return { id, type, batch: { predecessors: predecessorBatches } } as ProcessStepEntity;
}

export function createBatch(processStepId: string): BatchEntity {
  return { processStepId } as BatchEntity;
}

export async function setupTraversalServiceTestingModule(): Promise<{
  service: TraversalService;
  processStepServiceMock: Record<string, jest.Mock>;
}> {
  const processStepServiceMock = {
    readProcessStep: jest.fn(),
  };

  const moduleRef = await Test.createTestingModule({
    providers: [
      TraversalService,
      { provide: ProcessStepService, useValue: processStepServiceMock },
    ],
  }).compile();

  const service = moduleRef.get(TraversalService);
  return { service, processStepServiceMock };
}
