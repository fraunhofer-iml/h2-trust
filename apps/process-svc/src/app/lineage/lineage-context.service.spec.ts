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
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityHydrogenTransportationMock,
  ProcessStepEntityPowerProductionMock,
  ProcessStepEntityWaterConsumptionMock
} from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { LineageContextService } from './lineage-context.service';
import { ProcessLineageService } from './process-lineage.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('LineageContextService', () => {
  let service: LineageContextService;
  let lineage: ProcessLineageService;
  let batchSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LineageContextService,
        {
          provide: ProcessLineageService,
          useValue: {
            fetchPowerProductionProcessSteps: jest.fn(),
            fetchWaterConsumptionProcessSteps: jest.fn(),
            fetchHydrogenProductionProcessSteps: jest.fn(),
            fetchHydrogenBottlingProcessStep: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(LineageContextService);
    lineage = module.get(ProcessLineageService);
    batchSvc = module.get(BrokerQueues.QUEUE_BATCH_SVC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('build() should return context for POWER_PRODUCTION', async () => {
    const root = structuredClone(ProcessStepEntityPowerProductionMock[0]);

    jest.spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(root));

    const ctx = await service.build(root.id);

    expect(ctx.root.id).toBe(root.id);
    expect(ctx.powerProductionProcessSteps).toEqual([root]);
    expect(ctx.waterConsumptionProcessSteps).toEqual([]);
    expect(ctx.hydrogenProductionProcessSteps).toEqual([]);
    expect(ctx.hydrogenBottlingProcessStep).toBeUndefined();
  });

  it('build() should return context for HYDROGEN_PRODUCTION', async () => {
    const root = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    const powerSteps = [structuredClone(ProcessStepEntityPowerProductionMock[0])];

    jest.spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(root));
    const fetchPowerSpy = jest.spyOn(lineage, 'fetchPowerProductionProcessSteps').mockResolvedValue(powerSteps);

    const ctx = await service.build(root.id);

    expect(fetchPowerSpy).toHaveBeenCalledTimes(1);
    expect(fetchPowerSpy).toHaveBeenCalledWith([root]);

    expect(ctx.root.id).toBe(root.id);
    expect(ctx.hydrogenProductionProcessSteps).toEqual([root]);
    expect(ctx.powerProductionProcessSteps).toEqual(powerSteps);
    expect(ctx.hydrogenBottlingProcessStep).toBeUndefined();
  });

  it('build() should return context for HYDROGEN_BOTTLING', async () => {
    const root = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenProduction = [structuredClone(ProcessStepEntityHydrogenProductionMock[0])];
    const waterSteps = [structuredClone(ProcessStepEntityWaterConsumptionMock[0])];
    const powerSteps = [structuredClone(ProcessStepEntityPowerProductionMock[0])];

    jest.spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(root));
    const fetchHydrogenProdSpy = jest
      .spyOn(lineage, 'fetchHydrogenProductionProcessSteps')
      .mockResolvedValue(hydrogenProduction);
    const fetchWaterSpy = jest.spyOn(lineage, 'fetchWaterConsumptionProcessSteps').mockResolvedValue(waterSteps);
    const fetchPowerSpy = jest.spyOn(lineage, 'fetchPowerProductionProcessSteps').mockResolvedValue(powerSteps);

    const ctx = await service.build(root.id);

    expect(fetchHydrogenProdSpy).toHaveBeenCalledTimes(1);
    expect(fetchHydrogenProdSpy).toHaveBeenCalledWith(root);
    expect(fetchWaterSpy).toHaveBeenCalledTimes(1);
    expect(fetchWaterSpy).toHaveBeenCalledWith(hydrogenProduction);
    expect(fetchPowerSpy).toHaveBeenCalledTimes(1);
    expect(fetchPowerSpy).toHaveBeenCalledWith(hydrogenProduction);

    expect(ctx.root.id).toBe(root.id);
    expect(ctx.hydrogenBottlingProcessStep?.id).toBe(root.id);
    expect(ctx.hydrogenProductionProcessSteps).toEqual(hydrogenProduction);
    expect(ctx.waterConsumptionProcessSteps).toEqual(waterSteps);
    expect(ctx.powerProductionProcessSteps).toEqual(powerSteps);
  });

  it('build() should return context for HYDROGEN_TRANSPORTATION', async () => {
    const root = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const hydrogenBottling = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenProduction = [structuredClone(ProcessStepEntityHydrogenProductionMock[0])];
    const waterSteps = [structuredClone(ProcessStepEntityWaterConsumptionMock[0])];
    const powerSteps = [structuredClone(ProcessStepEntityPowerProductionMock[0])];

    jest.spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(root));
    const fetchBottlingSpy = jest
      .spyOn(lineage, 'fetchHydrogenBottlingProcessStep')
      .mockResolvedValue(hydrogenBottling);
    const fetchHydrogenProdSpy = jest
      .spyOn(lineage, 'fetchHydrogenProductionProcessSteps')
      .mockResolvedValue(hydrogenProduction);
    const fetchWaterSpy = jest.spyOn(lineage, 'fetchWaterConsumptionProcessSteps').mockResolvedValue(waterSteps);
    const fetchPowerSpy = jest.spyOn(lineage, 'fetchPowerProductionProcessSteps').mockResolvedValue(powerSteps);

    const ctx = await service.build(root.id);

    expect(fetchBottlingSpy).toHaveBeenCalledTimes(1);
    expect(fetchBottlingSpy).toHaveBeenCalledWith(root);
    expect(fetchHydrogenProdSpy).toHaveBeenCalledTimes(1);
    expect(fetchHydrogenProdSpy).toHaveBeenCalledWith(hydrogenBottling);
    expect(fetchWaterSpy).toHaveBeenCalledTimes(1);
    expect(fetchWaterSpy).toHaveBeenCalledWith(hydrogenProduction);
    expect(fetchPowerSpy).toHaveBeenCalledTimes(1);
    expect(fetchPowerSpy).toHaveBeenCalledWith(hydrogenProduction);

    expect(ctx.root.id).toBe(root.id);
    expect(ctx.hydrogenBottlingProcessStep?.id).toBe(hydrogenBottling.id);
    expect(ctx.hydrogenProductionProcessSteps).toEqual(hydrogenProduction);
    expect(ctx.waterConsumptionProcessSteps).toEqual(waterSteps);
    expect(ctx.powerProductionProcessSteps).toEqual(powerSteps);
  });

  it('should throw for invalid process type', async () => {
    const invalid = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    invalid.type = 'INVALID' as unknown as ProcessType;
    jest.spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(invalid));

    await expect(service.build(invalid.id)).rejects.toThrow(
      `ProcessStep with ID ${invalid.id} has an invalid process type: ${invalid.type}`,
    );
  });
});
