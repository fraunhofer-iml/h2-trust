/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  BatchEntity,
  CompanyEntityHydrogenMock,
  CreateHydrogenTransportationPayload,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenTransportationMock,
  ReadByIdPayload,
  ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchRepository, HydrogenBottlingProcessStepSeed, ProcessStepRepository } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { TransportationService } from './transportation.service';

describe('ProcessStepController', () => {
  let controller: ProcessStepController;
  let processStepService: ProcessStepService;
  let transportationService: TransportationService;
  let configurationService: ConfigurationService;
  let processStepRepository: ProcessStepRepository;
  let batchRepository: BatchRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessStepController],
      providers: [
        ProcessStepService,
        TransportationService,
        ConfigurationService,
        {
          provide: BottlingService,
          useValue: {
            createHydrogenBottlingProcessStep: jest.fn(),
            calculateHydrogenComposition: jest.fn(),
          },
        },
        {
          provide: ProcessStepRepository,
          useValue: {
            findProcessStepsByPredecessorTypesAndCompany: jest.fn(),
            findProcessStepsByTypesAndActiveAndCompany: jest.fn(),
            findProcessStep: jest.fn(),
            insertProcessStep: jest.fn(),
          },
        },
        {
          provide: BatchRepository,
          useValue: {
            setBatchesInactive: jest.fn(),
          },
        },
        {
          provide: ConfigurationService,
          useValue: {
            getGlobalConfiguration: jest
              .fn()
              .mockReturnValue({ minio: { endpoint: 'http://minio', bucket: 'test-bucket' } }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProcessStepController>(ProcessStepController);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
    transportationService = module.get<TransportationService>(TransportationService);
    configurationService = module.get<ConfigurationService>(ConfigurationService);
    processStepRepository = module.get<ProcessStepRepository>(ProcessStepRepository);
    batchRepository = module.get<BatchRepository>(BatchRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should read process steps by predecessor types and company', async () => {
    const givenPayload = ReadProcessStepsByPredecessorTypesAndCompanyPayload.of(
      [ProcessType.HYDROGEN_PRODUCTION],
      CompanyEntityHydrogenMock.id,
    );

    const expectedResponse: ProcessStepEntity[] = [structuredClone(ProcessStepEntityHydrogenBottlingMock[0])];

    const processStepServiceSpy = jest.spyOn(processStepService, 'readProcessStepsByPredecessorTypesAndCompany');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'findProcessStepsByPredecessorTypesAndCompany')
      .mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readProcessStepsByPredecessorTypesAndCompany(givenPayload);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read process steps by types and active and company', async () => {
    const givenPayload = ReadProcessStepsByTypesAndActiveAndCompanyPayload.of(
      [ProcessType.HYDROGEN_PRODUCTION],
      true,
      CompanyEntityHydrogenMock.id,
    );

    const expectedResponse: ProcessStepEntity[] = [structuredClone(ProcessStepEntityHydrogenBottlingMock[0])];

    const processStepServiceSpy = jest.spyOn(processStepService, 'readProcessStepsByTypesAndActiveAndCompany');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'findProcessStepsByTypesAndActiveAndCompany')
      .mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readProcessStepsByTypesAndActiveAndCompany(givenPayload);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read process step', async () => {
    const givenPayload = ReadByIdPayload.of(ProcessStepEntityHydrogenBottlingMock[0].id);

    const expectedResponse: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    expectedResponse.documents = [];

    const processStepServiceSpy = jest.spyOn(processStepService, 'readProcessStep');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'findProcessStep')
      .mockResolvedValue(expectedResponse);

    const configurationServiceSpy = jest.spyOn(configurationService, 'getGlobalConfiguration');

    const actualResponse = await controller.readProcessStep(givenPayload);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(configurationServiceSpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen transportation process step', async () => {
    const expectedResponse: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const givenPredecessorBatch: BatchEntity = structuredClone(HydrogenBottlingProcessStepSeed[0]);

    const transportationServiceSpy = jest.spyOn(transportationService, 'createHydrogenTransportationProcessStep');

    const batchRepositorySpy = jest.spyOn(batchRepository, 'setBatchesInactive');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'insertProcessStep')
      .mockResolvedValue(expectedResponse);

    const payload: CreateHydrogenTransportationPayload = CreateHydrogenTransportationPayload.of(
      expectedResponse,
      givenPredecessorBatch,
      expectedResponse.transportationDetails,
    );

    const actualResponse = await controller.createHydrogenTransportationProcessStep(payload);

    expect(transportationServiceSpy).toHaveBeenCalledTimes(1);
    expect(batchRepositorySpy).toHaveBeenCalledTimes(1);
    expect(batchRepositorySpy).toHaveBeenCalledWith([payload.predecessorBatch.id]);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
