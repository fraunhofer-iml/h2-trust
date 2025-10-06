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
  PowerProductionTypeEntity,
  PowerProductionTypeEntityMock,
  PowerProductionUnitEntity,
  PowerProductionUnitEntityMock,
  ProcessStepEntity,
  ProcessStepEntityPowerProductionMock,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchDto, ClassificationDto } from '@h2-trust/api';
import { ProofOfOriginDtoAssembler } from '../assembler/proof-of-origin-dto.assembler';
import { EnergySourceClassificationService } from './energy-source-classification.service';

describe('EnergySourceClassificationService', () => {
  let service: EnergySourceClassificationService;
  let generalSvc: ClientProxy;

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
      ],
    }).compile();

    service = module.get(EnergySourceClassificationService);
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return empty list when no process steps are given', async () => {
    const emptyProcessSteps: ProcessStepEntity[] = [];
    const powerProductionTypes: PowerProductionTypeEntity[] = [
      PowerProductionTypeEntityMock[0],
      PowerProductionTypeEntityMock[1],
    ];

    const generalSvcSpy = jest.spyOn(generalSvc, 'send').mockImplementation(
      (messagePattern: UnitMessagePatterns) =>
        messagePattern === UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES ? of(powerProductionTypes) : of(), // no unit fetches because no steps
    );

    const expectedResponse: ClassificationDto[] = [];
    const actualResponse: ClassificationDto[] =
      await service.buildEnergySourceClassificationsFromProcessSteps(emptyProcessSteps);

    expect(generalSvcSpy).toHaveBeenCalledTimes(1);
    expect(generalSvcSpy).toHaveBeenCalledWith(UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES, {});

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should build one classification for a single energy source with one process step', async () => {
    const powerProductionProcessSteps: ProcessStepEntity[] = [structuredClone(ProcessStepEntityPowerProductionMock[0])];
    const powerProductionTypes: PowerProductionTypeEntity[] = [
      PowerProductionTypeEntityMock[0],
      PowerProductionTypeEntityMock[1],
    ];

    const powerProductionUnit: PowerProductionUnitEntity = structuredClone(PowerProductionUnitEntityMock[0]);
    powerProductionUnit.id = powerProductionProcessSteps[0].executedBy.id;
    powerProductionUnit.type = powerProductionTypes[1];

    const generalSvcSpy = jest
      .spyOn(generalSvc, 'send')
      .mockImplementation((pattern: UnitMessagePatterns, payload: any) => {
        if (pattern === UnitMessagePatterns.READ_POWER_PRODUCTION_TYPES) {
          return of(powerProductionTypes);
        }
        if (pattern === UnitMessagePatterns.READ && payload.id === powerProductionProcessSteps[0].executedBy.id) {
          return of(powerProductionUnit);
        }
        return of(undefined);
      });

    const batchDto: BatchDto = ProofOfOriginDtoAssembler.assembleProductionPowerBatchDto(
      powerProductionProcessSteps[0],
      powerProductionUnit.type.energySource,
    );
    const expectedResponse: ClassificationDto[] = [
      ProofOfOriginDtoAssembler.assemblePowerClassification(powerProductionUnit.type.energySource, [batchDto]),
    ];
    const actualResponse: ClassificationDto[] =
      await service.buildEnergySourceClassificationsFromProcessSteps(powerProductionProcessSteps);

    expect(generalSvcSpy).toHaveBeenCalledTimes(1 + 1); // types + unit
    expect(actualResponse).toEqual(expectedResponse);
  });
});
