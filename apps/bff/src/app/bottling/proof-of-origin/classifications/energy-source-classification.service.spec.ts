/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  LineageContextEntity,
  PowerProductionTypeEntity,
  PowerProductionTypeEntityMock,
  PowerProductionUnitEntity,
  PowerProductionUnitEntityMock,
  ProcessStepEntity,
  ProcessStepEntityPowerProductionMock,
  SustainabilityMessagePatterns,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchDto, ClassificationDto } from '@h2-trust/api';
import { EnergySourceClassificationService } from './energy-source-classification.service';

describe('EnergySourceClassificationService', () => {
  let service: EnergySourceClassificationService;
  let generalSvc: ClientProxy;
  let processSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnergySourceClassificationService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(EnergySourceClassificationService);
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC);
    processSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_PROCESS_SVC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty list when no process steps are given', async () => {
    const givenPowerProductionProcessSteps: ProcessStepEntity[] = [];

    const generalSvcSpy = jest.spyOn(generalSvc, 'send');

    const actualResponse: ClassificationDto[] = await service.buildEnergySourceClassificationsFromContext(
      givenPowerProductionProcessSteps,
    );

    expect(generalSvcSpy).toHaveBeenCalledTimes(0);

    expect(actualResponse).toEqual([]);
  });

  it('should build one classification for a single energy source with one process step', async () => {
    const powerProductionProcessSteps: ProcessStepEntity[] = [structuredClone(ProcessStepEntityPowerProductionMock[0])];
    powerProductionProcessSteps[0].batch.successors = [powerProductionProcessSteps[0].batch];
    const powerProductionTypes: PowerProductionTypeEntity[] = [
      PowerProductionTypeEntityMock[0],
      PowerProductionTypeEntityMock[1],
    ];

    const powerProductionUnit: PowerProductionUnitEntity = structuredClone(PowerProductionUnitEntityMock[0]);
    powerProductionUnit.id = powerProductionProcessSteps[0].executedBy.id;
    powerProductionUnit.type = powerProductionTypes[1];

    const generalSvcSpy = jest.spyOn(generalSvc, 'send').mockImplementation((pattern: any, payload: any) => {
      if (pattern === UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES) {
        return of(powerProductionTypes);
      }
      if (pattern === UnitMessagePatterns.READ && payload.id === powerProductionProcessSteps[0].executedBy.id) {
        return of(powerProductionUnit);
      }
      return of(undefined);
    });

    const processSvcSpy = jest.spyOn(processSvc, 'send').mockImplementation((pattern: any) => {
      if (pattern === SustainabilityMessagePatterns.COMPUTE_POWER_FOR_STEP) {
        return of({ result: 0, basisOfCalculation: '' });
      }
      return of(undefined);
    });

    const root: ProcessStepEntity = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    const ctx: LineageContextEntity = {
      root,
      hydrogenProductionProcessSteps: [],
      powerProductionProcessSteps,
    };

    const actualResponse: ClassificationDto[] = await service.buildEnergySourceClassificationsFromContext(
      ctx.powerProductionProcessSteps,
    );

    expect(generalSvcSpy).toHaveBeenCalledTimes(2); // types + unit
    expect(processSvcSpy).toHaveBeenCalledTimes(1);

    expect(actualResponse.length).toBe(1);
    expect(actualResponse[0].name).toBe(powerProductionUnit.type.energySource);

    const batchIds = (actualResponse[0].batches || []).map((b: BatchDto) => b.id);
    expect(batchIds).toEqual([powerProductionProcessSteps[0].batch.id]);
  });
});
