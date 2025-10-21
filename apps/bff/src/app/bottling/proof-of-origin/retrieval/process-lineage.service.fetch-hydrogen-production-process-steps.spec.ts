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
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { ProcessLineageService } from './process-lineage.service';
import { ProcessStepService } from './process-step.service';

describe('ProcessLineageService#fetchHydrogenProductionProcessSteps', () => {
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

    service = module.get<ProcessLineageService>(ProcessLineageService);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw if process step is undefined', async () => {
    const expectedErrorMessage = `Process step of type [${ProcessType.HYDROGEN_BOTTLING}] is missing.`;

    await expect(service.fetchHydrogenProductionProcessSteps(undefined)).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw if process step has wrong type', async () => {
    const hydrogenProduction: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);

    const expectedErrorMessage = `All process steps must be of type ${ProcessType.HYDROGEN_BOTTLING}, but found invalid process types: ${hydrogenProduction.id}:${hydrogenProduction.type}`;

    await expect(service.fetchHydrogenProductionProcessSteps(hydrogenProduction)).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw if bottling step has no predecessor batches', async () => {
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    hydrogenBottling.batch.predecessors = undefined;

    const expectedErrorMessage = `No further predecessors could be found for process step(s) with ID ${hydrogenBottling.id}`;

    await expect(service.fetchHydrogenProductionProcessSteps(hydrogenBottling)).rejects.toThrow(expectedErrorMessage);
  });

  it('should return hydrogen production predecessor steps (single predecessor)', async () => {
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenProduction: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    hydrogenBottling.batch.predecessors = [{ id: hydrogenProduction.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([hydrogenProduction]);

    const expectedResponse = [hydrogenProduction];
    const actualResponse = await service.fetchHydrogenProductionProcessSteps(hydrogenBottling);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return hydrogen production predecessor steps (multiple predecessors)', async () => {
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenProduction1: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const hydrogenProduction2: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[1]);

    hydrogenBottling.batch.predecessors = [{ id: hydrogenProduction1.batch.id }, { id: hydrogenProduction2.batch.id }];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStepsOfBatches')
      .mockResolvedValueOnce([hydrogenProduction1, hydrogenProduction2]);

    const expectedResponse = [hydrogenProduction1, hydrogenProduction2];
    const actualResponse = await service.fetchHydrogenProductionProcessSteps(hydrogenBottling);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toHaveLength(2);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw if returned predecessor steps are not hydrogen production', async () => {
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const powerProduction: ProcessStepEntity = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    hydrogenBottling.batch.predecessors = [{ id: powerProduction.batch.id }];

    jest.spyOn(processStepService, 'fetchProcessStepsOfBatches').mockResolvedValueOnce([powerProduction]);

    const expectedErrorMessage = `All process steps must be of type ${ProcessType.HYDROGEN_PRODUCTION}, but found invalid process types: ${powerProduction.id}:${powerProduction.type}`;

    await expect(service.fetchHydrogenProductionProcessSteps(hydrogenBottling)).rejects.toThrow(expectedErrorMessage);
  });

  it('should throw if number of returned hydrogen production steps does not match predecessor batches', async () => {
    const hydrogenBottling: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenProduction1: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const hydrogenProduction2: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[1]);
    hydrogenBottling.batch.predecessors = [{ id: hydrogenProduction1.batch.id }, { id: hydrogenProduction2.batch.id }];

    jest.spyOn(processStepService, 'fetchProcessStepsOfBatches').mockResolvedValueOnce([hydrogenProduction1]);

    const expectedErrorMessage = `Number of process steps must be exactly 2, but found 1.`;

    await expect(service.fetchHydrogenProductionProcessSteps(hydrogenBottling)).rejects.toThrow(expectedErrorMessage);
  });
});
