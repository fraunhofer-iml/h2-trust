/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ConfigurationService } from '@h2-trust/configuration';
import { DocumentEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  HydrogenBottlingUnitEntityFixture,
  ProcessStepEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenProductionStatisticsPayload,
  CreateManyProcessStepsPayload,
  CreateProcessStepPayload,
  CreateProcessStepQualityPayload,
  ProductionDataFilter,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/contracts/payloads';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { PowerType, ProcessType, RfnboType } from '@h2-trust/domain';
import { QUEUE_GENERAL_SVC } from '@h2-trust/messaging';
import { CentralizedStorageService, ContentType } from '@h2-trust/storage';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepService', () => {
  let service: ProcessStepService;

  const configurationServiceMock = {
    getGlobalConfiguration: jest.fn().mockReturnValue({
      centralizedStorage: {
        endpointUrl: 'http://localhost:9000',
        bucketName: 'test-bucket',
      },
    }),
  };

  const batchRepositoryMock = {
    setRfnboStatus: jest.fn(),
    setBatchesInactive: jest.fn(),
  };

  const storageServiceMock = {
    uploadFile: jest.fn(),
  };

  const documentRepositoryMock = {
    addDocumentToProcessStep: jest.fn(),
  };

  const generalSvcMock = {
    send: jest.fn(),
  };

  const processStepRepositoryMock = {
    findAllProcessStepsFromUnits: jest.fn(),
    insertProcessStep: jest.fn(),
    insertManyProcessSteps: jest.fn(),
    setBatchesInactive: jest.fn(),
    findPredecessorProcessSteps: jest.fn(),
    findProcessStep: jest.fn(),
    findProcessSteps: jest.fn(),
    findProcessStepsByPredecessorTypesAndOwner: jest.fn(),
    findAllProcessStepsFromStorageUnit: jest.fn(),
    findProcessStepsByTypesAndActiveAndOwner: jest.fn(),
    readAllProcessStepsFromUnits: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessStepService,
        {
          provide: ConfigurationService,
          useValue: configurationServiceMock,
        },
        {
          provide: BatchRepository,
          useValue: batchRepositoryMock,
        },
        {
          provide: ProcessStepRepository,
          useValue: processStepRepositoryMock,
        },
        {
          provide: CentralizedStorageService,
          useValue: storageServiceMock,
        },
        {
          provide: DocumentRepository,
          useValue: documentRepositoryMock,
        },
        {
          provide: QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
      ],
    }).compile();

    service = module.get<ProcessStepService>(ProcessStepService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createHydrogenBottlingProcessStep', () => {
    it(`should create a bottling process step when called`, async () => {
      const qualityDetails: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );
      // arrange
      const givenPayload = new CreateProcessStepPayload(
        qualityDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'company-1',
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          details: QualityDetailsEntityFixture.create(),
        }),
      });

      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const expectedResult = { count: 2 };
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
      ];
      const givenExecutingUnit = HydrogenBottlingUnitEntityFixture.create();

      generalSvcMock.send.mockReturnValueOnce(of(givenExecutingUnit));
      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenProcessStep);
      processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner.mockResolvedValue(givenProcessSteps);
      processStepRepositoryMock.findAllProcessStepsFromStorageUnit.mockResolvedValue(givenProcessSteps);
      processStepRepositoryMock.findAllProcessStepsFromUnits.mockResolvedValue([givenStorageProcessStep]);
      processStepRepositoryMock.setBatchesInactive.mockResolvedValue(givenCreatedBottlingProcessStep);
      batchRepositoryMock.setBatchesInactive.mockResolvedValue(expectedResult);
      processStepRepositoryMock.insertProcessStep.mockResolvedValue(givenProcessStep);

      // act
      const actualResult = await service.createGenericProcessStep(givenPayload);

      // assert
      expect(processStepRepositoryMock.findAllProcessStepsFromUnits).toHaveBeenCalledWith([
        givenPayload.predecessorUnitId,
      ]);
      expect(batchRepositoryMock.setBatchesInactive).toHaveBeenCalledWith([givenStorageProcessStep.batch.id]);
      expect(processStepRepositoryMock.insertProcessStep).toHaveBeenCalledTimes(1);
      expect(actualResult.id).toBe(givenCreatedBottlingProcessStep.id);
      expect(batchRepositoryMock.setBatchesInactive).toHaveBeenCalledWith([givenProcessSteps[0].batch.id]);
    });

    it('should create a bottling process step for non-certifiable hydrogen when using the computed composition', async () => {
      // arrange
      const qualityDetails: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
        RfnboType.NON_CERTIFIABLE,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );
      // arrange
      const givenPayload = new CreateProcessStepPayload(
        qualityDetails,
        ProcessType.HYDROGEN_BOTTLING,
        50,
        'owner-1',
        'recorder-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
      );

      const givenRfnboReadyStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'storage-process-step-1',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'storage-batch-1',
          processStepId: 'storage-process-step-1',
          amount: 50,
          details: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.RFNBO_READY }),
        }),
      });
      const givenNonCertifiableStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'storage-process-step-2',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'storage-batch-2',
          processStepId: 'storage-process-step-2',
          amount: 50,
          details: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.NON_CERTIFIABLE }),
        }),
      });
      const givenConsumedSplitReadyProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'consumed-split-ready',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'consumed-split-ready-batch',
          processStepId: 'consumed-split-ready',
          amount: 25,
          predecessors: [givenRfnboReadyStorageProcessStep.batch],
          details: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.RFNBO_READY }),
        }),
      });
      const givenConsumedSplitNonCertifiableProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'consumed-split-non-certifiable',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'consumed-split-non-certifiable-batch',
          processStepId: 'consumed-split-non-certifiable',
          amount: 25,
          predecessors: [givenNonCertifiableStorageProcessStep.batch],
          details: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.NON_CERTIFIABLE }),
        }),
      });
      const givenRemainingReadyProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'remaining-ready',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'remaining-ready-batch',
          processStepId: 'remaining-ready',
          amount: 25,
          details: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.RFNBO_READY }),
        }),
      });
      const givenRemainingNonCertifiableProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        id: 'remaining-non-certifiable',
        batch: BatchEntityFixture.createHydrogenBatch({
          id: 'remaining-non-certifiable-batch',
          processStepId: 'remaining-non-certifiable',
          amount: 25,
          details: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.NON_CERTIFIABLE }),
        }),
      });
      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenExecutingUnit = HydrogenBottlingUnitEntityFixture.create();

      generalSvcMock.send.mockReturnValueOnce(of(givenExecutingUnit));
      processStepRepositoryMock.findAllProcessStepsFromUnits.mockResolvedValue([
        givenRfnboReadyStorageProcessStep,
        givenNonCertifiableStorageProcessStep,
      ]);
      processStepRepositoryMock.setBatchesInactive.mockResolvedValue({ count: 2 });
      processStepRepositoryMock.insertProcessStep
        .mockResolvedValueOnce(givenConsumedSplitReadyProcessStep)
        .mockResolvedValueOnce(givenConsumedSplitNonCertifiableProcessStep)
        .mockResolvedValueOnce(givenRemainingReadyProcessStep)
        .mockResolvedValueOnce(givenRemainingNonCertifiableProcessStep)
        .mockResolvedValueOnce(givenCreatedBottlingProcessStep);
      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);

      // act
      const actualResult = await service.createGenericProcessStep(givenPayload);

      // assert
      expect(batchRepositoryMock.setBatchesInactive).toHaveBeenCalledWith([
        givenRfnboReadyStorageProcessStep.batch.id,
        givenNonCertifiableStorageProcessStep.batch.id,
      ]);
      expect(processStepRepositoryMock.insertProcessStep).toHaveBeenCalledTimes(5);
      expect(processStepRepositoryMock.insertProcessStep.mock.calls[4][0]).toEqual(
        expect.objectContaining({
          type: ProcessType.HYDROGEN_BOTTLING,
          batch: expect.objectContaining({
            predecessors: expect.arrayContaining([
              expect.objectContaining({ id: givenConsumedSplitReadyProcessStep.batch.id }),
              expect.objectContaining({ id: givenConsumedSplitNonCertifiableProcessStep.batch.id }),
            ]),
          }),
        }),
      );
      expect(actualResult).toEqual(givenCreatedBottlingProcessStep);
    });

    it('should throw error when no process steps found in storage unit', async () => {
      // arrange
      const qualityDetails: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );
      // arrange
      const givenPayload = new CreateProcessStepPayload(
        qualityDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'owner-1',
        'recorder-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
      );
      const givenExecutingUnit = HydrogenBottlingUnitEntityFixture.create();

      generalSvcMock.send.mockReturnValueOnce(of(givenExecutingUnit));
      processStepRepositoryMock.findAllProcessStepsFromUnits.mockResolvedValue([]);

      const expectedErrorMessage = `No process steps found in unit '${givenPayload.predecessorUnitId}'`;

      // act & assert
      await expect(service.createGenericProcessStep(givenPayload)).rejects.toThrow(expectedErrorMessage);
    });

    it('should throw when uploaded file has no buffer', async () => {
      // arrange
      const givenFile = { originalname: 'test.pdf' } as Express.Multer.File;
      const qualityDetails: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );
      // arrange
      const givenPayload = new CreateProcessStepPayload(
        qualityDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'owner-1',
        'recorder-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
        [givenFile],
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          details: QualityDetailsEntityFixture.create(),
        }),
      });
      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenExecutingUnit = HydrogenBottlingUnitEntityFixture.create();

      generalSvcMock.send.mockReturnValueOnce(of(givenExecutingUnit));
      processStepRepositoryMock.findAllProcessStepsFromUnits.mockResolvedValue([givenStorageProcessStep]);
      processStepRepositoryMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepRepositoryMock.insertProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);

      // act & assert
      await expect(service.createGenericProcessStep(givenPayload)).rejects.toThrow('file.buffer');
      expect(storageServiceMock.uploadFile).not.toHaveBeenCalled();
      expect(documentRepositoryMock.addDocumentToProcessStep).not.toHaveBeenCalled();
    });

    it('should upload files when provided in the payload', async () => {
      // arrange
      const givenFile = { originalname: 'test.pdf', buffer: Buffer.from('test') } as Express.Multer.File;
      const qualityDetails: CreateProcessStepQualityPayload = new CreateProcessStepQualityPayload(
        RfnboType.RFNBO_READY,
        PowerType.NOT_SPECIFIED,
        100,
        100,
        100,
        100,
        100,
        100,
        100,
      );
      // arrange
      const givenPayload = new CreateProcessStepPayload(
        qualityDetails,
        ProcessType.HYDROGEN_BOTTLING,
        100,
        'owner-1',
        'recorder-1',
        new Date('2024-01-15T10:00:00Z'),
        new Date('2024-01-15T10:00:00Z'),
        'storage-unit-1',
        'hydrogen-production-unit-1',
        [givenFile],
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          details: QualityDetailsEntityFixture.create(),
        }),
      });

      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenExecutingUnit = HydrogenBottlingUnitEntityFixture.create();

      processStepRepositoryMock.insertProcessStep.mockClear();
      processStepRepositoryMock.insertProcessStep.mockReset();
      processStepRepositoryMock.findAllProcessStepsFromUnits.mockResolvedValue([givenStorageProcessStep]);
      processStepRepositoryMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepRepositoryMock.insertProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      storageServiceMock.uploadFile.mockResolvedValue(givenFile.originalname);
      documentRepositoryMock.addDocumentToProcessStep.mockResolvedValue({});

      generalSvcMock.send.mockReturnValueOnce(of(givenExecutingUnit));

      // act
      await service.createGenericProcessStep(givenPayload);

      // assert
      expect(storageServiceMock.uploadFile).toHaveBeenCalledWith(
        givenFile.originalname,
        Buffer.from(givenFile.buffer),
        ContentType.PDF,
      );
      expect(documentRepositoryMock.addDocumentToProcessStep).toHaveBeenCalledWith(
        new DocumentEntity(undefined, givenFile.originalname),
        givenCreatedBottlingProcessStep.id,
      );
    });
  });

  describe('getPredecessors', () => {
    it('should load predecessor process steps and return them with the given process step first when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenPredecessorProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createPowerProduction(),
      ];
      const expectedPredecessorIds = givenPredecessorProcessSteps.map((processStep) => processStep.id);

      processStepRepositoryMock.findPredecessorProcessSteps.mockResolvedValue(expectedPredecessorIds);
      processStepRepositoryMock.findProcessSteps.mockResolvedValue(givenPredecessorProcessSteps);

      // act
      const actualResult = await service.getPredecessors(givenProcessStep);

      // assert
      expect(processStepRepositoryMock.findPredecessorProcessSteps).toHaveBeenCalledWith(givenProcessStep.batch.id);
      expect(processStepRepositoryMock.findProcessSteps).toHaveBeenCalledWith(expectedPredecessorIds);
      expect(actualResult).toEqual([givenProcessStep, ...givenPredecessorProcessSteps]);
    });
  });

  describe('createManyProcessSteps', () => {
    it('should delegate to ProcessStepRepository when called', async () => {
      // arrange
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenProduction(),
      ];
      const givenPayload = new CreateManyProcessStepsPayload(givenProcessSteps);

      processStepRepositoryMock.insertManyProcessSteps.mockResolvedValue(givenProcessSteps);

      // act
      const actualResult = await service.createManyProcessSteps(givenPayload);

      // assert
      expect(processStepRepositoryMock.insertManyProcessSteps).toHaveBeenCalledWith(givenProcessSteps);
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStep', () => {
    it('should return process step with assembled documents for non-transportation type when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenProcessStep);

      // act
      const actualResult = await service.readProcessStep(givenProcessStep.id);

      // assert
      expect(processStepRepositoryMock.findProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(actualResult.id).toBe(givenProcessStep.id);
      expect(actualResult.documents).toHaveLength(1);
      expect(actualResult.documents[0].id).toBe('document-1');
      expect(actualResult.documents[0].fileName).toBe('some.pdf');
      expect(actualResult.documents[0].storageUrl).toBe('http://localhost:9000/test-bucket/some.pdf');
    });

    it('should return transportation process step with documents from predecessor when called', async () => {
      // arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      givenTransportationProcessStep.batch.predecessors = [givenPredecessorProcessStep.batch];

      processStepRepositoryMock.findProcessStep
        .mockResolvedValueOnce(givenTransportationProcessStep)
        .mockResolvedValueOnce(givenPredecessorProcessStep);

      // act
      const actualResult = await service.readProcessStep(givenTransportationProcessStep.id);

      // assert
      expect(processStepRepositoryMock.findProcessStep).toHaveBeenCalledTimes(2);
      expect(actualResult.id).toBe(givenTransportationProcessStep.id);
      expect(actualResult.documents).toHaveLength(1);
      expect(actualResult.documents[0].id).toBe('document-1');
      expect(actualResult.documents[0].fileName).toBe('some.pdf');
      expect(actualResult.documents[0].storageUrl).toBe('http://localhost:9000/test-bucket/some.pdf');
    });

    it('should throw error when transportation has no predecessor', async () => {
      // arrange
      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      givenTransportationProcessStep.batch.predecessors = [];

      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenTransportationProcessStep);

      const expectedErrorMessage = 'ProcessStepId of predecessor is missing.';

      // act & assert
      const actualResult = service.readProcessStep(givenTransportationProcessStep.id);

      await expect(actualResult).rejects.toThrow(expectedErrorMessage);
    });
  });

  it('readAllHydrogenComponentsFromUnits', () => {
    //TODO-LG: add tests for this
    expect(service).toBeDefined();
  });

  describe('readProcessStepsByPredecessorTypesAndUnitAndDate', () => {
    it('should delegate to ProcessStepRepository with unit name and normalized month date when called', async () => {
      // arrange
      const givenPayload = new CreateHydrogenProductionStatisticsPayload(
        'company-1',
        new Date('2026-01-01T00:00:00Z'),
        'Hydrogen Production Unit 1',
      );
      const givenPredecessorTypes = [ProcessType.POWER_PRODUCTION];
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenProduction()];

      processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner.mockResolvedValue(givenProcessSteps);

      // act
      const actualResult = await service.readProcessStepsByPredecessorTypesAndUnitAndDate(
        givenPredecessorTypes,
        givenPayload,
      );

      // assert
      expect(processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner).toHaveBeenCalledWith(
        givenPredecessorTypes,
        givenPayload.ownerId,
        givenPayload.unitName,
        new Date(givenPayload.month),
      );
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStepsByTypesAndActiveAndOwner', () => {
    it('should delegate to ProcessStepRepository when called', async () => {
      // arrange
      const givenPayload = new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
        [ProcessType.HYDROGEN_BOTTLING],
        true,
        'company-1',
      );
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenBottling()];

      processStepRepositoryMock.findProcessStepsByTypesAndActiveAndOwner.mockResolvedValue(givenProcessSteps);

      // act
      const actualResult = await service.readProcessStepsByTypesAndActiveAndOwner(givenPayload);

      // assert
      expect(processStepRepositoryMock.findProcessStepsByTypesAndActiveAndOwner).toHaveBeenCalledWith(
        givenPayload.processTypes,
        givenPayload.active,
        givenPayload.ownerId,
      );
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readPaginatedProcessStepsByPredecessorTypesAndOwner', () => {
    it('should throw when page number is not greater than zero', async () => {
      // arrange
      const givenPayload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
        new ProductionDataFilter(0, 10),
      );

      // act & assert
      await expect(service.readPaginatedProductions(givenPayload)).rejects.toThrow(
        'pageNumber must be greater than 0, got 0',
      );
      expect(processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner).not.toHaveBeenCalled();
    });

    it('should throw when page size is not greater than zero', async () => {
      // arrange
      const givenPayload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
        new ProductionDataFilter(1, 0),
      );

      // act & assert
      await expect(service.readPaginatedProductions(givenPayload)).rejects.toThrow(
        'pageSize must be greater than 0, got 0',
      );
      expect(processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner).not.toHaveBeenCalled();
    });

    it('should return the requested page of process steps with pagination metadata when called', async () => {
      // arrange
      const givenProcesses = [
        ProcessStepEntityFixture.createHydrogenBottling({ id: 'process-step-1' }),
        ProcessStepEntityFixture.createHydrogenProduction({ id: 'process-step-2' }),
        ProcessStepEntityFixture.createPowerProduction({ id: 'process-step-3' }),
      ];
      const givenPayload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
        new ProductionDataFilter(2, 1, 'Hydrogen Production Unit 1', new Date('2026-01-01T00:00:00Z')),
      );

      processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner.mockResolvedValue(givenProcesses);

      // act
      const actualResult = await service.readPaginatedProductions(givenPayload);

      // assert
      expect(processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner).toHaveBeenCalledWith(
        givenPayload.predecessorProcessTypes,
        givenPayload.ownerId,
        givenPayload.filter.unitName,
        new Date(givenPayload.filter.month),
      );
      expect(actualResult.processSteps).toEqual([givenProcesses[1]]);
      expect(actualResult.currentPage).toBe(2);
      expect(actualResult.pageSize).toBe(1);
      expect(actualResult.totalAmountOfItems).toBe(3);
    });
  });

  describe('readProcessStepsByTypesAndActiveAndOwner', () => {
    it('should delegate to ProcessStepService when called', async () => {
      // arrange
      const givenPayload = new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
        [ProcessType.HYDROGEN_BOTTLING],
        true,
        'company-1',
      );
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenBottling()];

      processStepRepositoryMock.findProcessStepsByTypesAndActiveAndOwner.mockResolvedValue(givenProcessSteps);

      // act
      const actualResult = await service.readProcessStepsByTypesAndActiveAndOwner(givenPayload);

      // assert
      expect(processStepRepositoryMock.findProcessStepsByTypesAndActiveAndOwner).toHaveBeenCalledWith(
        givenPayload.processTypes,
        givenPayload.active,
        givenPayload.ownerId,
      );
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });
});
