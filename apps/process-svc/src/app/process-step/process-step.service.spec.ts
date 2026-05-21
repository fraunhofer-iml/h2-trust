/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigurationService } from '@h2-trust/configuration';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenProductionStatisticsPayload,
  CreateManyProcessStepsPayload,
  ProductionDataFilter,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/contracts/payloads';
import { BatchRepository, ProcessStepRepository } from '@h2-trust/database';
import { ProcessType, RfnboType } from '@h2-trust/domain';
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

  const processStepRepositoryMock = {
    findPredecessorProcessSteps: jest.fn(),
    findProcessSteps: jest.fn(),
    insertProcessStep: jest.fn(),
    insertManyProcessSteps: jest.fn(),
    findProcessStep: jest.fn(),
    findAllProcessStepsFromStorageUnit: jest.fn(),
    findProcessStepsByPredecessorTypesAndOwner: jest.fn(),
    findProcessStepsByTypesAndActiveAndOwner: jest.fn(),
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

  describe('updateRfnboStatus', () => {
    it('should delegate to BatchRepository with the batch id and RFNBO type when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const expectedResult = { id: 'quality-details-1', batchId: givenProcessStep.batch.id };

      batchRepositoryMock.setRfnboStatus.mockResolvedValue(expectedResult);

      // act
      const actualResult = await service.updateRfnboStatus(givenProcessStep, RfnboType.RFNBO_READY);

      // assert
      expect(batchRepositoryMock.setRfnboStatus).toHaveBeenCalledWith(givenProcessStep.batch.id, RfnboType.RFNBO_READY);
      expect(actualResult).toEqual(expectedResult);
    });
  });

  describe('createProcessStep', () => {
    it('should delegate to ProcessStepRepository when called', async () => {
      // arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepRepositoryMock.insertProcessStep.mockResolvedValue(givenProcessStep);

      // act
      const actualResult = await service.createProcessStep(givenProcessStep);

      // assert
      expect(processStepRepositoryMock.insertProcessStep).toHaveBeenCalledWith(givenProcessStep);
      expect(actualResult).toEqual(givenProcessStep);
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

    it('should throw error when predecessor is not hydrogen bottling', async () => {
      // arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      givenTransportationProcessStep.batch.predecessors = [givenPredecessorProcessStep.batch];

      processStepRepositoryMock.findProcessStep
        .mockResolvedValueOnce(givenTransportationProcessStep)
        .mockResolvedValueOnce(givenPredecessorProcessStep);

      const expectedErrorMessage = `Expected process type of predecessor to be ${ProcessType.HYDROGEN_BOTTLING}, but got ${ProcessType.HYDROGEN_PRODUCTION}.`;

      // act & assert
      const actualResult = service.readProcessStep(givenTransportationProcessStep.id);

      await expect(actualResult).rejects.toThrow(expectedErrorMessage);
    });
  });

  describe('readAllProcessStepsFromStorageUnit', () => {
    it('should delegate to ProcessStepRepository when called', async () => {
      // arrange
      const givenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
      ];

      processStepRepositoryMock.findAllProcessStepsFromStorageUnit.mockResolvedValue(givenProcessSteps);

      // act
      const actualResult = await service.readAllProcessStepsFromStorageUnit(givenStorageUnitId);

      // assert
      expect(processStepRepositoryMock.findAllProcessStepsFromStorageUnit).toHaveBeenCalledWith(givenStorageUnitId);
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStepsByPredecessorTypesAndOwner', () => {
    it('should delegate to ProcessStepRepository when called', async () => {
      // arrange
      const givenPayload = new ReadProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
      );
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenBottling()];

      processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner.mockResolvedValue(givenProcessSteps);

      // act
      const actualResult = await service.readProcessStepsByPredecessorTypesAndOwner(givenPayload);

      // assert
      expect(processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner).toHaveBeenCalledWith(
        givenPayload.predecessorProcessTypes,
        givenPayload.ownerId,
      );
      expect(actualResult).toEqual(givenProcessSteps);
    });
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

  describe('readPaginatedProcessStepsByPredecessorTypesAndOwner', () => {
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
      const actualResult = await service.readPaginatedProcessStepsByPredecessorTypesAndOwner(givenPayload);

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

  describe('setBatchesInactive', () => {
    it('should delegate to BatchRepository when called', async () => {
      // arrange
      const givenBatchIds = ['batch-1', 'batch-2'];
      const expectedResult = { count: 2 };

      batchRepositoryMock.setBatchesInactive.mockResolvedValue(expectedResult);

      // act
      const actualResult = await service.setBatchesInactive(givenBatchIds);

      // assert
      expect(batchRepositoryMock.setBatchesInactive).toHaveBeenCalledWith(givenBatchIds);
      expect(actualResult).toEqual(expectedResult);
    });
  });
});
