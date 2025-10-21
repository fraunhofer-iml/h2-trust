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
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProcessLineageService } from './process-lineage.service';
import { ProcessStepService } from './process-step.service';

describe('ProcessLineageService#fetchPowerProductionProcessSteps', () => {
  let processLineageService: ProcessLineageService;
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

    processLineageService = module.get<ProcessLineageService>(ProcessLineageService);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(processLineageService).toBeDefined();
  });

  it('should throw if input is undefined', async () => {
    const expectedErrorMessage = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

    await expect(processLineageService.fetchPowerProductionProcessSteps(undefined)).rejects.toThrow(
      expectedErrorMessage,
    );
  });

  it('should throw if input is empty', async () => {
    const expectedErrorMessage = `Process steps of type [${ProcessType.HYDROGEN_PRODUCTION}] are missing.`;

    await expect(processLineageService.fetchPowerProductionProcessSteps([])).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw if a process step has wrong type', async () => {
    const powerProduction: ProcessStepEntity = structuredClone(ProcessStepEntityPowerProductionMock[0]);

    const expectedErrorMessage = `All process steps must be of type ${ProcessType.HYDROGEN_PRODUCTION}, but found invalid process types: ${powerProduction.id}:${powerProduction.type}`;

    await expect(processLineageService.fetchPowerProductionProcessSteps([powerProduction])).rejects.toThrow(
      expectedErrorMessage,
    );
  });

  it('should throw if a hydrogen production step has no predecessor batches', async () => {
    const hydrogenProduction = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    hydrogenProduction.batch.predecessors = undefined;

    const expectedErrorMessage = `No further predecessors could be found for process step(s) with ID ${hydrogenProduction.id}`;

    await expect(processLineageService.fetchPowerProductionProcessSteps([hydrogenProduction])).rejects.toThrow(
      expectedErrorMessage,
    );
  });

  it('should collect power production steps from a single layer', async () => {
    const hydrogenProduction = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const powerProduction1 = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    const powerProduction2 = structuredClone(ProcessStepEntityPowerProductionMock[1]);

    hydrogenProduction.batch.predecessors = [{ id: powerProduction1.batch.id }, { id: powerProduction2.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([powerProduction1, powerProduction2]);

    const expectedResponse = [powerProduction1, powerProduction2];
    const actualResponse = await processLineageService.fetchPowerProductionProcessSteps([hydrogenProduction]);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should traverse multiple hydrogen production layers before reaching power production', async () => {
    // Layer 0 input: hydrogenProduction1 -> predecessors -> batch-hydrogenProduction2
    // Layer 1 fetched: hydrogenProduction2 -> predecessors -> batch-powerProduction1, batch-powerProduction2
    // Layer 2 fetched: powerProduction1, powerProduction2
    const hydrogenProduction1 = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const hydrogenProduction2 = structuredClone(ProcessStepEntityHydrogenProductionMock[1]);
    const powerProduction1 = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    const powerProduction2 = structuredClone(ProcessStepEntityPowerProductionMock[1]);

    hydrogenProduction1.batch.predecessors = [{ id: hydrogenProduction2.batch.id }];
    hydrogenProduction2.batch.predecessors = [{ id: powerProduction1.batch.id }, { id: powerProduction2.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([hydrogenProduction2]) // hydrogenProduction1 predecessors
      .mockResolvedValueOnce([powerProduction1, powerProduction2]); // hydrogenProduction2 predecessors

    const expectedResponse = [powerProduction1, powerProduction2];
    const actualResponse = await processLineageService.fetchPowerProductionProcessSteps([hydrogenProduction1]);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(2);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should deduplicate power production steps collected from different branches', async () => {
    const hydrogenProduction1 = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const hydrogenProduction2 = structuredClone(ProcessStepEntityHydrogenProductionMock[1]);
    const powerProduction = structuredClone(ProcessStepEntityPowerProductionMock[0]);

    hydrogenProduction1.batch.predecessors = [{ id: powerProduction.batch.id }];
    hydrogenProduction2.batch.predecessors = [{ id: powerProduction.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([powerProduction, powerProduction]);

    const expectedResponse = [powerProduction];
    const actualResponse = await processLineageService.fetchPowerProductionProcessSteps([
      hydrogenProduction1,
      hydrogenProduction2,
    ]);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toHaveLength(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should stop traversal when only power production steps are returned', async () => {
    const hydrogenProduction = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const powerProduction = structuredClone(ProcessStepEntityPowerProductionMock[0]);

    hydrogenProduction.batch.predecessors = [{ id: powerProduction.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([powerProduction]);

    const expectedResponse = [powerProduction];
    const actualResponse = await processLineageService.fetchPowerProductionProcessSteps([hydrogenProduction]);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toHaveLength(1);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
