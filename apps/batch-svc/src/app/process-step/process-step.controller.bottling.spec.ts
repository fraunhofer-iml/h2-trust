/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  BatchEntityHydrogenProducedMock,
  BrokerQueues,
  CreateHydrogenBottlingPayload,
  HydrogenStorageUnitEntityMock,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
  ReadByIdPayload,
  UnitMessagePatterns,
} from '@h2-trust/amqp';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { HydrogenColor } from '@h2-trust/domain';
import { StorageService } from '@h2-trust/storage';
import { BatchSelectionService } from './bottling/batch-selection.service';
import { BottlingService } from './bottling/bottling.service';
import { HydrogenComponentAssembler } from './bottling/hydrogen-component-assembler';
import { ProcessStepAssemblerService } from './bottling/process-step-assembler.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { TransportationService } from './transportation.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('ProcessStepController / Bottling', () => {
  let controller: ProcessStepController;
  let processStepRepository: ProcessStepRepository;
  let batchRepository: BatchRepository;
  let bottlingService: BottlingService;
  let batchSelectionService: BatchSelectionService;
  let storageService: StorageService;
  let documentRepository: DocumentRepository;
  let processStepService: ProcessStepService;
  let generalSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessStepController],
      providers: [
        BottlingService,
        TransportationService,
        {
          provide: ProcessStepService,
          useValue: {
            readProcessStep: jest.fn(),
            readProcessSteps: jest.fn(),
            readProcessStepById: jest.fn(),
            createProcessStep: jest.fn(),
          },
        },
        {
          provide: BatchSelectionService,
          useValue: {
            processBottlingForAllColors: jest.fn(),
          },
        },
        ProcessStepAssemblerService,
        {
          provide: StorageService,
          useValue: {
            uploadFileWithDeepPath: jest.fn(),
          },
        },
        {
          provide: DocumentRepository,
          useValue: {
            addDocumentToProcessStep: jest.fn(),
          },
        },
        {
          provide: ProcessStepRepository,
          useValue: {
            findProcessSteps: jest.fn(),
            findProcessStep: jest.fn(),
            insertProcessStep: jest.fn(),
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
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProcessStepController>(ProcessStepController);
    processStepRepository = module.get<ProcessStepRepository>(ProcessStepRepository);
    batchRepository = module.get<BatchRepository>(BatchRepository);
    bottlingService = module.get<BottlingService>(BottlingService);
    batchSelectionService = module.get<BatchSelectionService>(BatchSelectionService);
    storageService = module.get<StorageService>(StorageService);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(bottlingService).toBeDefined();
  });

  it('should create hydrogen bottling process step', async () => {
    const expectedResponse: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    expectedResponse.documents = [];

    const givenProcessStep: ProcessStepEntity = structuredClone(expectedResponse);

    const findAllProcessStepsFromStorageUnitSpy = jest
      .spyOn(processStepRepository, 'findAllProcessStepsFromStorageUnit')
      .mockResolvedValue([ProcessStepEntityHydrogenProductionMock[0]]);

    const generalSvcSpy = jest
      .spyOn(generalSvc, 'send')
      .mockImplementation((_messagePattern: UnitMessagePatterns, _data: any) => of(HydrogenStorageUnitEntityMock[0]));

    const processBottlingForAllColorsSpy = jest
      .spyOn(batchSelectionService, 'processBottlingForAllColors')
      .mockReturnValue({
        batchesForBottle: [expectedResponse.batch],
        processStepsToBeSplit: [],
        consumedSplitProcessSteps: [],
        processStepsForRemainingAmount: [],
      });

    const readProcessStepSpy = jest.spyOn(processStepService, 'readProcessStep').mockResolvedValue(expectedResponse);

    const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
    const insertProcessStepSpy = jest.spyOn(processStepRepository, 'insertProcessStep').mockResolvedValue(expectedResponse);
    const uploadSpy = jest.spyOn(storageService, 'uploadFileWithDeepPath');
    const addDocSpy = jest.spyOn(documentRepository, 'addDocumentToProcessStep');

    const payload: CreateHydrogenBottlingPayload = CreateHydrogenBottlingPayload.of(
      givenProcessStep.batch.amount,
      givenProcessStep.batch.owner?.id ?? 'test-recipient',
      givenProcessStep.startedAt ?? new Date(),
      givenProcessStep.recordedBy?.id ?? 'test-user',
      givenProcessStep.executedBy.id,
      (givenProcessStep.batch.qualityDetails?.color ?? HydrogenColor.GREEN) as HydrogenColor,
      givenProcessStep.documents?.[0]?.description,
      [],
    );

    const actualResponse = await controller.createHydrogenBottlingProcessStep(payload);

    expect(findAllProcessStepsFromStorageUnitSpy).toHaveBeenCalledWith(givenProcessStep.executedBy.id);
    expect(generalSvcSpy).toHaveBeenCalledTimes(0);
    expect(processBottlingForAllColorsSpy).toHaveBeenCalledTimes(1);
    expect(setBatchesInactiveSpy).toHaveBeenCalledWith([expectedResponse.batch.id]);
    expect(insertProcessStepSpy).toHaveBeenCalledTimes(1);
    expect(uploadSpy).toHaveBeenCalledTimes(0);
    expect(addDocSpy).toHaveBeenCalledTimes(0);
    expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
    expect(readProcessStepSpy).toHaveBeenCalledWith(ReadByIdPayload.of(expectedResponse.id));
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should calculate hydrogen composition', async () => {
    const givenBottlingProcessStep = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    givenBottlingProcessStep.batch.predecessors = [BatchEntityHydrogenProducedMock[0]];

    const readProcessStepSpy = jest
      .spyOn(processStepService, 'readProcessStep')
      .mockResolvedValue(givenBottlingProcessStep);

    const payload: ReadByIdPayload = ReadByIdPayload.of(givenBottlingProcessStep.id);

    const expectedResponse = HydrogenComponentAssembler.assembleFromBottlingProcessStep(givenBottlingProcessStep);
    const actualResponse = await controller.calculateHydrogenComposition(payload);

    expect(readProcessStepSpy).toHaveBeenCalledWith(payload);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
