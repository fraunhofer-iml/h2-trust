/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenTransportationMock,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProcessLineageService } from './process-lineage.service';
import { ProcessStepService } from './process-step.service';

describe('ProcessLineageService#fetchHydrogenBottlingProcessStep', () => {
  let service: ProcessLineageService;
  let processStepService: ProcessStepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessLineageService,
        {
          provide: ProcessStepService,
          useValue: {
            fetchProcessStepsOfBatches: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ProcessLineageService);
    processStepService = module.get(ProcessStepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if process step is undefined', async () => {
    const expectedErrorMessage = `Process step of type [${ProcessType.HYDROGEN_TRANSPORTATION}] is missing.`;

    await expect(service.fetchHydrogenBottlingProcessStep(undefined)).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw if process step has wrong type', async () => {
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);

    const expectedErrorMessage = `All process steps must be of type ${ProcessType.HYDROGEN_TRANSPORTATION}, but found invalid process types: ${hydrogenBottling.id}:${hydrogenBottling.type}`;

    await expect(service.fetchHydrogenBottlingProcessStep(hydrogenBottling)).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw if transportation step has no predecessor batches', async () => {
    const hydrogenTransportation: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    hydrogenTransportation.batch.predecessors = undefined;

    const expectedErrorMessage = `No further predecessors could be found for process step(s) with ID ${hydrogenTransportation.id}`;

    await expect(service.fetchHydrogenBottlingProcessStep(hydrogenTransportation)).rejects.toThrow(
      expectedErrorMessage,
    );
  });

  it('should return hydrogen bottling predecessor step', async () => {
    const hydrogenTransportation: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    hydrogenTransportation.batch.predecessors = [{ id: hydrogenBottling.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([hydrogenBottling]);

    const expectedResponse = hydrogenBottling;
    const actualResponse = await service.fetchHydrogenBottlingProcessStep(hydrogenTransportation);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw if returned predecessor step is not hydrogen bottling', async () => {
    const hydrogenTransportation: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const powerProduction: ProcessStepEntity = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    hydrogenTransportation.batch.predecessors = [{ id: powerProduction.batch.id }];

    jest.spyOn(processStepService, 'fetchProcessStepsOfBatches').mockResolvedValueOnce([powerProduction]);

    const expectedErrorMessage = `All process steps must be of type ${ProcessType.HYDROGEN_BOTTLING}, but found invalid process types: ${powerProduction.id}:${powerProduction.type}`;

    await expect(service.fetchHydrogenBottlingProcessStep(hydrogenTransportation)).rejects.toThrow(
      expectedErrorMessage,
    );
  });

  it('should throw if more than one hydrogen bottling predecessor is returned', async () => {
    const hydrogenTransportation: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const hydrogenBottling1: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenBottling2: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[1]);
    hydrogenTransportation.batch.predecessors = [
      { id: hydrogenBottling1.batch.id },
      { id: hydrogenBottling2.batch.id },
    ];

    jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([hydrogenBottling1, hydrogenBottling2]);

    const expectedErrorMessage = 'Number of process steps must be exactly 1, but found 2.';

    await expect(service.fetchHydrogenBottlingProcessStep(hydrogenTransportation)).rejects.toThrow(
      expectedErrorMessage,
    );
  });

  it('should throw if no hydrogen bottling predecessor is returned', async () => {
    const hydrogenTransportation: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    hydrogenTransportation.batch.predecessors = [{ id: hydrogenBottling.batch.id }];

    jest.spyOn(processStepService, 'fetchProcessStepsOfBatches').mockResolvedValueOnce([]);

    const expectedErrorMessage = 'Number of process steps must be exactly 1, but found 0.';

    await expect(service.fetchHydrogenBottlingProcessStep(hydrogenTransportation)).rejects.toThrow(
      expectedErrorMessage,
    );
  });
});
