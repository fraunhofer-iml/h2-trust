/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BatchEntity,
  BatchEntityHydrogenBottledMock,
  BatchEntityHydrogenTransportedMock,
  BrokerQueues,
  CompanyEntityHydrogenMock,
  CreateHydrogenBottlingPayload,
  CreateHydrogenTransportationPayload,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityHydrogenTransportationMock,
  ReadProcessStepsByPredecessorTypesAndCompanyPayload,
  ReadProcessStepsByTypesAndActiveAndCompanyPayload,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { HydrogenColor, ProcessType } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { BottlingService } from './bottling/bottling.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { TransportationService } from './transportation/transportation.service';

describe('ProcessStepController', () => {
  let controller: ProcessStepController;
  let processStepService: ProcessStepService;
  let bottlingService: BottlingService;
  let transportationService: TransportationService;
  let batchRepository: BatchRepository;
  let processStepRepository: ProcessStepRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessStepController],
      providers: [
        ProcessStepService,
        BottlingService,
        TransportationService,
        {
          provide: ConfigurationService,
          useValue: {
            getGlobalConfiguration: jest
              .fn()
              .mockReturnValue({ minio: { endpoint: 'http://minio', bucket: 'test-bucket' } }),
          },
        },
        {
          provide: BatchRepository,
          useValue: {
            setBatchesInactive: jest.fn(),
          },
        },
        {
          provide: ProcessStepRepository,
          useValue: {
            findProcessStepsByPredecessorTypesAndCompany: jest.fn(),
            findProcessStepsByTypesAndActiveAndCompany: jest.fn(),
            findProcessStep: jest.fn(),
            insertProcessStep: jest.fn(),
            findAllProcessStepsFromStorageUnit: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: DocumentRepository,
          useValue: {
            addDocumentToProcessStep: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            uploadFileWithDeepPath: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProcessStepController>(ProcessStepController);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
    bottlingService = module.get<BottlingService>(BottlingService);
    transportationService = module.get<TransportationService>(TransportationService);
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
    // Arrange
    const givenPayload = new ReadProcessStepsByPredecessorTypesAndCompanyPayload(
      [ProcessType.HYDROGEN_PRODUCTION],
      CompanyEntityHydrogenMock.id,
    );

    const expectedResponse: ProcessStepEntity[] = [structuredClone(ProcessStepEntityHydrogenBottlingMock[0])];

    const processStepServiceSpy = jest.spyOn(processStepService, 'readProcessStepsByPredecessorTypesAndCompany');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'findProcessStepsByPredecessorTypesAndCompany')
      .mockResolvedValue(expectedResponse);

    // Act
    const actualResponse = await controller.readProcessStepsByPredecessorTypesAndCompany(givenPayload);

    // Assert
    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read process steps by types and active and company', async () => {
    // Arrange
    const givenPayload = new ReadProcessStepsByTypesAndActiveAndCompanyPayload(
      [ProcessType.HYDROGEN_PRODUCTION],
      true,
      CompanyEntityHydrogenMock.id,
    );

    const expectedResponse: ProcessStepEntity[] = [structuredClone(ProcessStepEntityHydrogenBottlingMock[0])];

    const processStepServiceSpy = jest.spyOn(processStepService, 'readProcessStepsByTypesAndActiveAndCompany');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'findProcessStepsByTypesAndActiveAndCompany')
      .mockResolvedValue(expectedResponse);

    // Act
    const actualResponse = await controller.readProcessStepsByTypesAndActiveAndCompany(givenPayload);

    // Assert
    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen bottling process step', async () => {
    // Arrange
    const expectedResponse: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    expectedResponse.documents = [];

    const productionProcessStep: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);

    jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue([productionProcessStep]);

    jest.spyOn(processStepRepository, 'insertProcessStep').mockResolvedValue(expectedResponse);

    jest.spyOn(processStepRepository, 'findProcessStep').mockResolvedValue(expectedResponse);

    const bottlingServiceSpy = jest.spyOn(bottlingService, 'createHydrogenBottlingProcessStep');

    const batchRepositorySpy = jest.spyOn(batchRepository, 'setBatchesInactive');

    const payload: CreateHydrogenBottlingPayload = new CreateHydrogenBottlingPayload(
      expectedResponse.batch.amount,
      expectedResponse.batch.owner?.id ?? 'test-owner',
      expectedResponse.startedAt ?? new Date(),
      expectedResponse.recordedBy?.id ?? 'test-user',
      expectedResponse.executedBy.id,
      HydrogenColor.GREEN,
      undefined,
      [],
    );

    // Act
    const actualResponse = await controller.createHydrogenBottlingProcessStep(payload);

    // Assert
    expect(bottlingServiceSpy).toHaveBeenCalledTimes(1);
    expect(bottlingServiceSpy).toHaveBeenCalledWith(payload);
    expect(batchRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should create hydrogen transportation process step', async () => {
    // Arrange
    const expectedResponse: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    const givenPredecessorBatch: BatchEntity = structuredClone(BatchEntityHydrogenTransportedMock[0]);

    const transportationServiceSpy = jest.spyOn(transportationService, 'createHydrogenTransportationProcessStep');

    const batchRepositorySpy = jest.spyOn(batchRepository, 'setBatchesInactive');

    const processStepRepositorySpy = jest
      .spyOn(processStepRepository, 'insertProcessStep')
      .mockResolvedValue(expectedResponse);

    const payload: CreateHydrogenTransportationPayload = new CreateHydrogenTransportationPayload(
      expectedResponse,
      givenPredecessorBatch,
      expectedResponse.transportationDetails.transportMode,
      expectedResponse.transportationDetails.distance,
      expectedResponse.transportationDetails.fuelType,
    );

    // Act
    const actualResponse = await controller.createHydrogenTransportationProcessStep(payload);

    // Assert
    expect(transportationServiceSpy).toHaveBeenCalledTimes(1);
    expect(batchRepositorySpy).toHaveBeenCalledTimes(1);
    expect(batchRepositorySpy).toHaveBeenCalledWith([payload.predecessorBatch.id]);
    expect(processStepRepositorySpy).toHaveBeenCalledTimes(1);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
