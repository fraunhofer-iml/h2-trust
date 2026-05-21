/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DocumentEntity } from '@h2-trust/contracts/entities';
import {
  BatchEntityFixture,
  HydrogenStorageUnitEntityFixture,
  ProcessStepEntityFixture,
  QualityDetailsEntityFixture,
} from '@h2-trust/contracts/entities/fixtures';
import {
  CreateHydrogenBottlingPayload,
  ProductionDataFilter,
  ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload,
  ReadProcessStepsByTypesAndActiveAndOwnerPayload,
} from '@h2-trust/contracts/payloads';
import { DocumentRepository } from '@h2-trust/database';
import { ProcessType, RfnboType } from '@h2-trust/domain';
import { CentralizedStorageService, ContentType } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step/process-step.service';
import { BottlingService } from './bottling.service';

describe('BottlingService', () => {
  let service: BottlingService;

  const storageServiceMock = {
    uploadFile: jest.fn(),
  };

  const documentRepositoryMock = {
    addDocumentToProcessStep: jest.fn(),
  };

  const processStepServiceMock = {
    readProcessStepsByTypesAndActiveAndOwner: jest.fn(),
    readPaginatedProcessStepsByPredecessorTypesAndOwner: jest.fn(),
    readAllProcessStepsFromStorageUnit: jest.fn(),
    setBatchesInactive: jest.fn(),
    createProcessStep: jest.fn(),
    readProcessStep: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BottlingService,
        {
          provide: CentralizedStorageService,
          useValue: storageServiceMock,
        },
        {
          provide: DocumentRepository,
          useValue: documentRepositoryMock,
        },
        {
          provide: ProcessStepService,
          useValue: processStepServiceMock,
        },
      ],
    }).compile();

    service = module.get<BottlingService>(BottlingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('readProcessStepsByTypesAndActiveAndOwner', () => {
    it('delegates to ProcessStepService', async () => {
      // Arrange
      const givenPayload = new ReadProcessStepsByTypesAndActiveAndOwnerPayload(
        [ProcessType.HYDROGEN_BOTTLING],
        true,
        'company-1',
      );
      const givenProcessSteps = [ProcessStepEntityFixture.createHydrogenBottling()];

      processStepServiceMock.readProcessStepsByTypesAndActiveAndOwner.mockResolvedValue(givenProcessSteps);

      // Act
      const actualResult = await service.readProcessStepsByTypesAndActiveAndOwner(givenPayload);

      // Assert
      expect(processStepServiceMock.readProcessStepsByTypesAndActiveAndOwner).toHaveBeenCalledWith(givenPayload);
      expect(actualResult).toEqual(givenProcessSteps);
    });
  });

  describe('readProcessStepsByPredecessorTypesAndOwner', () => {
    it('throws when page number is not greater than zero', async () => {
      // Arrange
      const givenPayload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
        new ProductionDataFilter(0, 10),
      );

      // Act & Assert
      await expect(service.readProcessStepsByPredecessorTypesAndOwner(givenPayload)).rejects.toThrow(
        'pageNumber must be greater than 0, got 0',
      );
      expect(processStepServiceMock.readPaginatedProcessStepsByPredecessorTypesAndOwner).not.toHaveBeenCalled();
    });

    it('throws when page size is not greater than zero', async () => {
      // Arrange
      const givenPayload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
        new ProductionDataFilter(1, 0),
      );

      // Act & Assert
      await expect(service.readProcessStepsByPredecessorTypesAndOwner(givenPayload)).rejects.toThrow(
        'pageSize must be greater than 0, got 0',
      );
      expect(processStepServiceMock.readPaginatedProcessStepsByPredecessorTypesAndOwner).not.toHaveBeenCalled();
    });

    it('delegates to ProcessStepService for valid pagination', async () => {
      // Arrange
      const givenPayload = new ReadPaginatedProcessStepsByPredecessorTypesAndOwnerPayload(
        [ProcessType.HYDROGEN_PRODUCTION],
        'company-1',
        new ProductionDataFilter(1, 10, 'Hydrogen Storage 1', new Date('2026-01-01T00:00:00Z')),
      );
      const expected = {
        processSteps: [ProcessStepEntityFixture.createHydrogenBottling()],
        currentPage: 1,
        pageSize: 10,
        totalAmountOfItems: 1,
      };

      processStepServiceMock.readPaginatedProcessStepsByPredecessorTypesAndOwner.mockResolvedValue(expected);

      // Act
      const actualResult = await service.readProcessStepsByPredecessorTypesAndOwner(givenPayload);

      // Assert
      expect(processStepServiceMock.readPaginatedProcessStepsByPredecessorTypesAndOwner).toHaveBeenCalledWith(
        givenPayload,
      );
      expect(actualResult).toEqual(expected);
    });
  });

  describe('createHydrogenBottlingProcessStep', () => {
    it(`creates bottling process step`, async () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.RFNBO_READY,
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.create(),
        }),
      });

      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([givenStorageProcessStep]);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepServiceMock.createProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      processStepServiceMock.readProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);

      // Act
      const actualResult = await service.createHydrogenBottlingProcessStep(givenPayload);

      // Assert
      expect(processStepServiceMock.readAllProcessStepsFromStorageUnit).toHaveBeenCalledWith(
        givenPayload.hydrogenStorageUnitId,
      );
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenStorageProcessStep.batch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledTimes(1);
      expect(actualResult.id).toBe(givenCreatedBottlingProcessStep.id);
    });

    it('creates bottling process step for non-certifiable hydrogen using computed composition', async () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.NON_CERTIFIABLE,
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.create({ rfnboType: RfnboType.NON_CERTIFIABLE }),
          hydrogenStorageUnit: HydrogenStorageUnitEntityFixture.create({ id: givenPayload.hydrogenStorageUnitId }),
        }),
      });
      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([givenStorageProcessStep]);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepServiceMock.createProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      processStepServiceMock.readProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);

      // Act
      const actualResult = await service.createHydrogenBottlingProcessStep(givenPayload);

      // Assert
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalledWith([givenStorageProcessStep.batch.id]);
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(givenCreatedBottlingProcessStep);
    });

    it('throws error when no process steps found in storage unit', async () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.RFNBO_READY,
      );

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([]);

      const expectedErrorMessage = `No process steps found in storage unit '${givenPayload.hydrogenStorageUnitId}'`;

      // Act & Assert
      await expect(service.createHydrogenBottlingProcessStep(givenPayload)).rejects.toThrow(expectedErrorMessage);
    });

    it('throws when uploaded file has no buffer', async () => {
      // Arrange
      const givenFile = { originalname: 'test.pdf' } as Express.Multer.File;
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.RFNBO_READY,
        [givenFile],
      );
      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.create(),
        }),
      });
      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([givenStorageProcessStep]);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepServiceMock.createProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);

      // Act & Assert
      await expect(service.createHydrogenBottlingProcessStep(givenPayload)).rejects.toThrow('file.buffer');
      expect(storageServiceMock.uploadFile).not.toHaveBeenCalled();
      expect(documentRepositoryMock.addDocumentToProcessStep).not.toHaveBeenCalled();
    });

    it('uploads files when provided in payload', async () => {
      // Arrange
      const givenFile = { originalname: 'test.pdf', buffer: Buffer.from('test') } as Express.Multer.File;
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        RfnboType.RFNBO_READY,
        [givenFile],
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.create(),
        }),
      });

      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([givenStorageProcessStep]);
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepServiceMock.createProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      processStepServiceMock.readProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      storageServiceMock.uploadFile.mockResolvedValue(givenFile.originalname);
      documentRepositoryMock.addDocumentToProcessStep.mockResolvedValue({});

      // Act
      await service.createHydrogenBottlingProcessStep(givenPayload);

      // Assert
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
});
