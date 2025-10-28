/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  LineageContextEntity,
  LineageMessagePatterns,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import 'multer';
import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { ProofOfOriginAssembler } from './proof-of-origin.assembler';
import { ProofOfOriginService } from './proof-of-origin.service';

describe('ProofOfOriginService', () => {
  let service: ProofOfOriginService;
  let assembler: ProofOfOriginAssembler;
  let processSvc: ClientProxy;

  let ctx: LineageContextEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProofOfOriginService,
        {
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: { send: jest.fn() },
        },
        {
          provide: ProofOfOriginAssembler,
          useValue: { build: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(ProofOfOriginService);
    assembler = module.get(ProofOfOriginAssembler);
    processSvc = module.get(BrokerQueues.QUEUE_PROCESS_SVC);

    ctx = {
      root: structuredClone(ProcessStepEntityPowerProductionMock[0]),
      hydrogenProductionProcessSteps: [],
      powerProductionProcessSteps: [],
    } as LineageContextEntity;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate to chain runner and assembler and return sections', async () => {
    const processStepId = 'step-123';
    const expectedSections: SectionDto[] = [{ name: 'Any', batches: [], classifications: [] }];

    const sendSpy = jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_pattern: LineageMessagePatterns, _payload: any) => of(ctx as any));

    jest.spyOn(assembler, 'build').mockResolvedValue(expectedSections);

    const actual = await service.readProofOfOrigin(processStepId);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith(LineageMessagePatterns.BUILD_CONTEXT, { processStepId });

    expect(assembler.build).toHaveBeenCalledTimes(1);
    expect(assembler.build).toHaveBeenCalledWith(ctx);

    expect(actual).toEqual(expectedSections);
  });
});
