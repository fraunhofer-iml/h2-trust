/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues, CreateHydrogenBottlingPayload, DocumentEntity } from '@h2-trust/amqp';
import { DocumentRepository } from '@h2-trust/database';
import { HydrogenColor, ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures/entities';
import { StorageService } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step.service';
import { BottlingService } from './bottling.service';

describe('BottlingService', () => {
  let service: BottlingService;

  const generalSvcMock = {
    send: jest.fn(),
  };

  const storageServiceMock = {
    uploadFile: jest.fn(),
  };

  const documentRepositoryMock = {
    addDocumentToProcessStep: jest.fn(),
  };

  const processStepServiceMock = {
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
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: generalSvcMock,
        },
        {
          provide: StorageService,
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

  describe('createHydrogenBottlingProcessStep', () => {
    it(`creates bottling process step for ${HydrogenColor.GREEN} hydrogen`, async () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.GREEN,
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
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
      expect(processStepServiceMock.setBatchesInactive).toHaveBeenCalled();
      expect(processStepServiceMock.createProcessStep).toHaveBeenCalled();
      expect(actualResult.id).toBe(givenCreatedBottlingProcessStep.id);
    });

    it(`creates bottling process step for non-${HydrogenColor.GREEN} hydrogen`, async () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.YELLOW,
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
      });

      const givenHydrogenStorageUnit = {
        id: 'storage-unit-1',
        filling: [{ color: HydrogenColor.GREEN, amount: 100 }],
      };

      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([givenStorageProcessStep]);
      generalSvcMock.send.mockReturnValue(of(givenHydrogenStorageUnit));
      processStepServiceMock.setBatchesInactive.mockResolvedValue({ count: 1 });
      processStepServiceMock.createProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);
      processStepServiceMock.readProcessStep.mockResolvedValue(givenCreatedBottlingProcessStep);

      // Act
      const actualResult = await service.createHydrogenBottlingProcessStep(givenPayload);

      // Assert
      expect(generalSvcMock.send).toHaveBeenCalled();
      expect(actualResult.id).toBe(givenCreatedBottlingProcessStep.id);
    });

    it('throws error when no process steps found in storage unit', async () => {
      // Arrange
      const givenPayload = new CreateHydrogenBottlingPayload(
        100,
        'owner-1',
        new Date('2024-01-15T10:00:00Z'),
        'recorder-1',
        'storage-unit-1',
        HydrogenColor.GREEN,
      );

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([]);

      const expectedErrorMessage = `No process steps found in storage unit ${givenPayload.hydrogenStorageUnitId}`;

      // Act & Assert
      await expect(service.createHydrogenBottlingProcessStep(givenPayload)).rejects.toThrow(expectedErrorMessage);
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
        HydrogenColor.GREEN,
        [givenFile],
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
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
      expect(storageServiceMock.uploadFile).toHaveBeenCalledWith(givenFile.originalname, Buffer.from(givenFile.buffer));
      expect(documentRepositoryMock.addDocumentToProcessStep).toHaveBeenCalledWith(
        new DocumentEntity(undefined, givenFile.originalname),
        givenCreatedBottlingProcessStep.id,
      );
    });
  });

  describe('calculateHydrogenComposition', () => {
    it(`returns composition for ${ProcessType.HYDROGEN_BOTTLING} process step`, async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });

      // Act
      const actualResult = await service.calculateHydrogenComposition(givenProcessStep);

      // Assert
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
    });

    it(`reads predecessor for ${ProcessType.HYDROGEN_TRANSPORTATION} process step`, async () => {
      // Arrange
      const givenBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              amount: 100,
              qualityDetails: QualityDetailsEntityFixture.createGreen(),
            }),
          ],
        }),
      });

      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              processStepId: givenBottlingProcessStep.id,
            }),
          ],
        }),
      });

      processStepServiceMock.readProcessStep.mockResolvedValue(givenBottlingProcessStep);

      // Act
      const actualResult = await service.calculateHydrogenComposition(givenTransportationProcessStep);

      // Assert
      expect(processStepServiceMock.readProcessStep).toHaveBeenCalledWith(givenBottlingProcessStep.id);
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0].color).toBe(HydrogenColor.GREEN);
    });

    it('throws error when transportation has no predecessor', async () => {
      // Arrange
      const givenProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [],
        }),
      });

      const expectedErrorMessage = `Process step ${givenProcessStep.id} has no predecessor to derive composition from`;

      // Act & Assert
      await expect(service.calculateHydrogenComposition(givenProcessStep)).rejects.toThrow(expectedErrorMessage);
    });

    it(`throws error when predecessor is not ${ProcessType.HYDROGEN_BOTTLING}`, async () => {
      // Arrange
      const givenPredecessorProcessStep = ProcessStepEntityFixture.createHydrogenProduction();

      const givenTransportationProcessStep = ProcessStepEntityFixture.createHydrogenTransportation({
        batch: BatchEntityFixture.createHydrogenBatch({
          predecessors: [
            BatchEntityFixture.createHydrogenBatch({
              processStepId: givenPredecessorProcessStep.id,
            }),
          ],
        }),
      });

      processStepServiceMock.readProcessStep.mockResolvedValue(givenPredecessorProcessStep);

      const expectedErrorMessage = `Predecessor process step ${givenPredecessorProcessStep.id} is not of type ${ProcessType.HYDROGEN_BOTTLING}`;

      // Act & Assert
      await expect(service.calculateHydrogenComposition(givenTransportationProcessStep)).rejects.toThrow(
        expectedErrorMessage,
      );
    });
  });
});
