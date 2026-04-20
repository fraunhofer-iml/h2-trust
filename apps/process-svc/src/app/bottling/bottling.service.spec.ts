/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/messaging';
import { DocumentRepository } from '@h2-trust/database';
import { HydrogenColor, RfnboType } from '@h2-trust/domain';
import { BatchEntityFixture, ProcessStepEntityFixture, QualityDetailsEntityFixture } from '@h2-trust/fixtures';
import { CentralizedStorageService, ContentType } from '@h2-trust/storage';
import { DigitalProductPassportService } from '../digital-product-passport/digital-product-passport.service';
import { ProcessStepService } from '../process-step/process-step.service';
import { BottlingService } from './bottling.service';
import { CreateHydrogenBottlingPayload, DocumentEntity } from '@h2-trust/contracts';

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

  const dppServiceMock = {
    determineRfnboTypeForProcessStepId: jest.fn(),
    determineRfnboTypeForProcessStep: jest.fn(),
    getDppForProcessStepId: jest.fn(),
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
        {
          provide: DigitalProductPassportService,
          useValue: dppServiceMock,
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
        RfnboType.RFNBO_READY,
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
      });

      const givenCreatedBottlingProcessStep = ProcessStepEntityFixture.createHydrogenBottling();

      processStepServiceMock.readAllProcessStepsFromStorageUnit.mockResolvedValue([givenStorageProcessStep]);
      dppServiceMock.determineRfnboTypeForProcessStep.mockResolvedValue(RfnboType.RFNBO_READY);
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
        RfnboType.NON_CERTIFIABLE,
      );

      const givenStorageProcessStep = ProcessStepEntityFixture.createHydrogenProduction({
        batch: BatchEntityFixture.createHydrogenBatch({
          amount: 100,
          qualityDetails: QualityDetailsEntityFixture.createGreen(),
        }),
      });

      const givenHydrogenStorageUnit = {
        id: 'storage-unit-1',
        filling: [{ color: HydrogenColor.GREEN, amount: 100, rfnboType: RfnboType.RFNBO_READY }],
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
        RfnboType.RFNBO_READY,
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
        RfnboType.RFNBO_READY,
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
      dppServiceMock.determineRfnboTypeForProcessStep.mockResolvedValue(RfnboType.RFNBO_READY);
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
