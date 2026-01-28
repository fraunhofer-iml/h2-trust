/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateManyProcessStepsPayload,
  ReadProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/amqp';
import { ConfigurationService } from '@h2-trust/configuration';
import { BatchRepository, ProcessStepRepository } from '@h2-trust/database';
import { ProcessType } from '@h2-trust/domain';
import { ProcessStepEntityFixture } from '@h2-trust/fixtures/entities';
import { ProcessStepService } from './process-step.service';

describe('ProcessStepService', () => {
  let service: ProcessStepService;

  const configurationServiceMock = {
    getGlobalConfiguration: jest.fn().mockReturnValue({
      minio: {
        endPoint: 'localhost',
        port: 9000,
        bucketName: 'test-bucket',
      },
    }),
  };

  const batchRepositoryMock = {
    setBatchesInactive: jest.fn(),
  };

  const processStepRepositoryMock = {
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

  describe('createProcessStep', () => {
    it('delegates to ProcessStepRepository', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepRepositoryMock.insertProcessStep.mockResolvedValue(givenProcessStep);

      // Act
      const actualResult = await service.createProcessStep(givenProcessStep);

      // Assert
      expect(processStepRepositoryMock.insertProcessStep).toHaveBeenCalledWith(givenProcessStep);
      expect(actualResult).toEqual(givenProcessStep);
    });
  });

  describe('createManyProcessSteps', () => {
    it('delegates to ProcessStepRepository', async () => {
      // Arrange
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenBottling(),
        ProcessStepEntityFixture.createHydrogenProduction(),
      ];
      const givenPayload = new CreateManyProcessStepsPayload(givenProcessSteps);

      processStepRepositoryMock.insertManyProcessSteps.mockResolvedValue(givenProcessSteps);

      // Act
      const actualResult = await service.createManyProcessSteps(givenPayload);

      // Assert
      expect(processStepRepositoryMock.insertManyProcessSteps).toHaveBeenCalledWith(givenProcessSteps);
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStep', () => {
    it('returns process step with assembled documents for non-transportation type', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenProcessStep);

      // Act
      const actualResult = await service.readProcessStep(givenProcessStep.id);

      // Assert
      expect(processStepRepositoryMock.findProcessStep).toHaveBeenCalledWith(givenProcessStep.id);
      expect(actualResult.id).toBe(givenProcessStep.id);
      expect(actualResult.documents).toHaveLength(1);
      expect(actualResult.documents[0].location).toBe('http://localhost:9000/test-bucket/dummy-document.pdf');
      expect(actualResult.documents[0].description).toBe('File #0');
    });

    it('returns transportation process step with documents from predecessor', async () => {
      // Arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenBottling();
      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      givenTransportationProcessStep.batch.predecessors = [givenPredecessorProcessStep.batch];

      processStepRepositoryMock.findProcessStep
        .mockResolvedValueOnce(givenTransportationProcessStep)
        .mockResolvedValueOnce(givenPredecessorProcessStep);

      // Act
      const actualResult = await service.readProcessStep(givenTransportationProcessStep.id);

      // Assert
      expect(processStepRepositoryMock.findProcessStep).toHaveBeenCalledTimes(2);
      expect(actualResult.id).toBe(givenTransportationProcessStep.id);
      expect(actualResult.documents).toHaveLength(1);
      expect(actualResult.documents[0].location).toBe('http://localhost:9000/test-bucket/dummy-document.pdf');
      expect(actualResult.documents[0].description).toBe('File #0');
    });

    it('throws error when transportation has no predecessor', async () => {
      // Arrange
      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      givenTransportationProcessStep.batch.predecessors = [];

      processStepRepositoryMock.findProcessStep.mockResolvedValue(givenTransportationProcessStep);

      const expectedErrorMessage = 'ProcessStepId of predecessor is missing.';

      // Act & Assert
      await expect(service.readProcessStep(givenTransportationProcessStep.id)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws error when predecessor is not hydrogen bottling', async () => {
      // Arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenProduction();
      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation();
      givenTransportationProcessStep.batch.predecessors = [givenPredecessorProcessStep.batch];

      processStepRepositoryMock.findProcessStep
        .mockResolvedValueOnce(givenTransportationProcessStep)
        .mockResolvedValueOnce(givenPredecessorProcessStep);

      const errorMessage = `Expected process type of predecessor to be ${ProcessType.HYDROGEN_BOTTLING}, but got ${ProcessType.HYDROGEN_PRODUCTION}.`;

      // Act & Assert
      await expect(service.readProcessStep(givenTransportationProcessStep.id)).rejects.toThrow(errorMessage);
    });
  });

  describe('readAllProcessStepsFromStorageUnit', () => {
    it('delegates to ProcessStepRepository', async () => {
      // Arrange
      const givenStorageUnitId = 'storage-unit-1';
      const givenProcessSteps = [
        ProcessStepEntityFixture.createHydrogenProduction(),
        ProcessStepEntityFixture.createHydrogenProduction(),
      ];

      processStepRepositoryMock.findAllProcessStepsFromStorageUnit.mockResolvedValue(givenProcessSteps);

      // Act
      const actualResult = await service.readAllProcessStepsFromStorageUnit(givenStorageUnitId);

      // Assert
      expect(processStepRepositoryMock.findAllProcessStepsFromStorageUnit).toHaveBeenCalledWith(givenStorageUnitId);
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStepsByPredecessorTypesAndOwner', () => {
    it('delegates to ProcessStepRepository', async () => {
      // Arrange
      const givenPayload = new ReadProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
      );
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenBottling()];

      processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner.mockResolvedValue(givenProcessSteps);

      // Act
      const actualResult = await service.readProcessStepsByPredecessorTypesAndOwner(givenPayload);

      // Assert
      expect(processStepRepositoryMock.findProcessStepsByPredecessorTypesAndOwner).toHaveBeenCalledWith(
        givenPayload.predecessorProcessTypes,
        givenPayload.ownerId,
      );
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStepsByTypesAndActiveAndOwner', () => {
    it('delegates to ProcessStepRepository', async () => {
      // Arrange
      const givenPayload = new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
        [ProcessType.HYDROGEN_BOTTLING],
        true,
        'company-1',
      );
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenBottling()];

      processStepRepositoryMock.findProcessStepsByTypesAndActiveAndOwner.mockResolvedValue(givenProcessSteps);

      // Act
      const actualResult = await service.readProcessStepsByTypesAndActiveAndOwner(givenPayload);

      // Assert
      expect(processStepRepositoryMock.findProcessStepsByTypesAndActiveAndOwner).toHaveBeenCalledWith(
        givenPayload.processTypes,
        givenPayload.active,
        givenPayload.ownerId,
      );
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('setBatchesInactive', () => {
    it('delegates to BatchRepository', async () => {
      // Arrange
      const givenBatchIds = ['batch-1', 'batch-2'];
      const expected = { count: 2 };

      batchRepositoryMock.setBatchesInactive.mockResolvedValue(expected);

      // Act
      const actualResult = await service.setBatchesInactive(givenBatchIds);

      // Assert
      expect(batchRepositoryMock.setBatchesInactive).toHaveBeenCalledWith(givenBatchIds);
      expect(actualResult).toEqual(expected);
    });
  });
});
