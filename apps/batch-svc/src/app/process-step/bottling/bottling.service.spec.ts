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
  BrokerException,
  BrokerQueues,
  ProcessStepEntityHydrogenProductionMock,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { ExpressMulterFileMock, parseColor } from '@h2-trust/api';
import { ConfigurationModule } from '@h2-trust/configuration';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { HydrogenColor } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { ProcessStepService } from '../process-step.service';
import { BatchSelectionService } from './batch-selection.service';
import { BottlingService } from './bottling.service';
import { calculateRemainingAmount } from './bottling.service.spec.util';
import { HydrogenCompositionService } from './hydrogen-composition.service';
import { ProcessStepAssemblerService } from './process-step-assembler.service';

describe('ProcessStepService', () => {
  let service: BottlingService;
  let processStepAssemblerService: ProcessStepAssemblerService;
  let processStepRepository: ProcessStepRepository;
  let batchRepository: BatchRepository;
  let generalService: ClientProxy;
  let storageService: StorageService;
  let documentRepository: DocumentRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigurationModule],
      providers: [
        BottlingService,
        ProcessStepService,
        HydrogenCompositionService,
        BatchSelectionService,
        ProcessStepAssemblerService,
        {
          provide: ProcessStepRepository,
          useValue: {
            insertProcessStep: jest.fn(),
            findProcessStep: jest.fn().mockResolvedValue(ProcessStepEntityHydrogenProductionMock[3]),
            findAllProcessStepsFromStorageUnit: jest.fn(),
          },
        },
        {
          provide: BatchRepository,
          useValue: {
            setBatchesInactive: jest.fn(),
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
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BottlingService>(BottlingService);
    processStepAssemblerService = module.get<ProcessStepAssemblerService>(ProcessStepAssemblerService);
    processStepRepository = module.get<ProcessStepRepository>(ProcessStepRepository);
    batchRepository = module.get<BatchRepository>(BatchRepository);
    storageService = module.get<StorageService>(StorageService);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    generalService = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
  });

  describe('successful bottling operations', () => {
    it('should create bottling ProcessStep', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntityHydrogenProductionMock.slice(3, 4));

      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');

      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);

      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      const uploadFileWithDeepPathSpy = jest.spyOn(storageService, 'uploadFileWithDeepPath');

      const addDocumentToProcessStepSpy = jest.spyOn(documentRepository, 'addDocumentToProcessStep');

      // Act
      await service.createHydrogenBottlingProcessStep(processStepData, ExpressMulterFileMock);

      // Assert
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
      expect(uploadFileWithDeepPathSpy).toHaveBeenCalledTimes(1);
      expect(addDocumentToProcessStepSpy).toHaveBeenCalledTimes(1);
    });

    it('should create bottling ProcessStep with split merge', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = 4;

      // Arrange
      const hydrogenProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(4, 5); // 5
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const processAssemblerAssembleMock = jest.spyOn(
        processStepAssemblerService,
        'assembleHydrogenProductionProcessStepForRemainingAmount',
      );
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const processAssemblerCreateMock = jest.spyOn(processStepAssemblerService, 'createBottlingProcessStep');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createHydrogenBottlingProcessStep(processStepData, undefined);

      // Assert
      expect(processAssemblerAssembleMock).toHaveBeenLastCalledWith(
        hydrogenProcessSteps[0],
        calculateRemainingAmount(
          hydrogenProcessSteps.map((processStep) => processStep.batch),
          processStepData.batch.amount,
        ),
        true,
      );
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(3);
      expect(processAssemblerCreateMock).toHaveBeenCalledWith(processStepData, expect.any(Array));
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create bottling ProcessStep with split merge and overfull storage tank', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = 6;

      // Arrange
      const hydrogenProcessSteps = ProcessStepEntityHydrogenProductionMock.slice(3, 6); // 5 + 5 + 5 = 15
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const processAssemblerAssembleMock = jest.spyOn(
        processStepAssemblerService,
        'assembleHydrogenProductionProcessStepForRemainingAmount',
      );
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const processAssemblerCreateMock = jest.spyOn(processStepAssemblerService, 'createBottlingProcessStep');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createHydrogenBottlingProcessStep(processStepData, undefined);

      // Assert
      const selectedBatches = hydrogenProcessSteps.slice(0, 2).map((step) => step.batch);
      expect(processAssemblerAssembleMock).toHaveBeenLastCalledWith(
        hydrogenProcessSteps.at(-2),
        calculateRemainingAmount(selectedBatches, processStepData.batch.amount),
        true,
      );
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(3);
      expect(processAssemblerCreateMock).toHaveBeenCalledWith(processStepData, expect.any(Array));
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create MIX bottling ProcessStep', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = 10;
      processStepData.batch.quality = `{"color":"${HydrogenColor.MIX}"}`;

      // Arrange
      const hydrogenProcessSteps = [
        ProcessStepEntityHydrogenProductionMock[0],
        ProcessStepEntityHydrogenProductionMock[9],
      ];
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue(hydrogenProcessSteps);
      const processAssemblerAssembleMock = jest.spyOn(
        processStepAssemblerService,
        'assembleHydrogenProductionProcessStepForRemainingAmount',
      );
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const processAssemblerCreateMock = jest.spyOn(processStepAssemblerService, 'createBottlingProcessStep');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');
      const generalServiceSpy = jest.spyOn(generalService, 'send');
      generalServiceSpy.mockImplementation((_messagePattern: UnitMessagePatterns.READ, _data: any) => {
        return of({
          id: 'hydrogen-storage-unit-id',
          filling: hydrogenProcessSteps.map((step) => ({
            color: parseColor(step.batch.quality),
            amount: step.batch.amount,
          })),
        });
      });

      // Act
      await service.createHydrogenBottlingProcessStep(processStepData, undefined);

      // Assert
      const totalStoredAmount = hydrogenProcessSteps.reduce((sum, step) => sum + step.batch.amount, 0);
      for (let i = 0; i < hydrogenProcessSteps.length; i += 1) {
        expect(processAssemblerAssembleMock).toHaveBeenNthCalledWith(
          2 * (i + 1), // Every second call goes to the assembling of the remaining amount batch
          hydrogenProcessSteps.at(i),
          hydrogenProcessSteps[i].batch.amount -
            (processStepData.batch.amount * hydrogenProcessSteps[i].batch.amount) / totalStoredAmount,
          true,
        );
      }
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(createProcessStepSpy).toHaveBeenCalledTimes(2 * hydrogenProcessSteps.length + 1);
      expect(processAssemblerCreateMock).toHaveBeenCalledWith(processStepData, expect.any(Array));
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });

    it('should create bottling ProcessStep only with green batches', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntityHydrogenProductionMock.slice(0, 3));
      const createProcessStepSpy = jest
        .spyOn(processStepRepository, 'insertProcessStep')
        .mockResolvedValue(processStepData);
      const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
      const readProcessStepSpy = jest.spyOn(processStepRepository, 'findProcessStep');

      // Act
      await service.createHydrogenBottlingProcessStep(processStepData, undefined);

      // Assert
      expect(createProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(setBatchesInactiveSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
      expect(readProcessStepSpy).toHaveBeenCalledWith(processStepData.id);
    });
  });

  describe('error cases', () => {
    it('should throw when insufficient hydrogen amount', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[3]);
      processStepData.batch.amount = 10000;

      // Arrange
      jest
        .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
        .mockResolvedValue(ProcessStepEntityHydrogenProductionMock.slice(3, 4));

      // Act & Assert
      await expect(service.createHydrogenBottlingProcessStep(processStepData, undefined)).rejects.toThrow(
        BrokerException,
      );
    });

    it('should throw when no hydrogen batches available', async () => {
      const processStepData = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);

      // Arrange
      jest.spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit').mockResolvedValue([]);

      // Act & Assert
      await expect(service.createHydrogenBottlingProcessStep(processStepData, undefined)).rejects.toThrow(
        BrokerException,
      );
    });
  });
});
