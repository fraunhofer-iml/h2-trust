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
  HydrogenCompositionEntityMock,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
} from '@h2-trust/amqp';
import { BatchRepository, DocumentRepository, ProcessStepRepository } from '@h2-trust/database';
import { StorageService } from '@h2-trust/storage';
import { BatchSelectionService } from './bottling/batch-selection.service';
import { BottlingService } from './bottling/bottling.service';
import { HydrogenComponentAssembler } from './bottling/hydrogen-component-assembler';
import { HydrogenCompositionService } from './bottling/hydrogen-composition.service';
import { ProcessStepAssemblerService } from './bottling/process-step-assembler.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { TransportationService } from './transportation.service';

describe('ProcessStepController / Bottling', () => {
  let controller: ProcessStepController;
  let processStepRepository: ProcessStepRepository;
  let batchRepository: BatchRepository;
  let bottlingService: BottlingService;
  let hydrogenCompositionService: HydrogenCompositionService;
  let batchSelectionService: BatchSelectionService;
  let processStepAssemblerService: ProcessStepAssemblerService;
  let storageService: StorageService;
  let documentRepository: DocumentRepository;
  let processStepService: ProcessStepService;

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
          provide: HydrogenCompositionService,
          useValue: {
            determineHydrogenComposition: jest.fn(),
          },
        },
        {
          provide: BatchSelectionService,
          useValue: {
            processBottlingForAllColors: jest.fn(),
          },
        },
        {
          provide: ProcessStepAssemblerService,
          useValue: {
            createBottlingProcessStep: jest.fn(),
          },
        },
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
      ],
    }).compile();

    controller = module.get<ProcessStepController>(ProcessStepController);
    processStepRepository = module.get<ProcessStepRepository>(ProcessStepRepository);
    batchRepository = module.get<BatchRepository>(BatchRepository);
    bottlingService = module.get<BottlingService>(BottlingService);
    hydrogenCompositionService = module.get<HydrogenCompositionService>(HydrogenCompositionService);
    batchSelectionService = module.get<BatchSelectionService>(BatchSelectionService);
    processStepAssemblerService = module.get<ProcessStepAssemblerService>(ProcessStepAssemblerService);
    storageService = module.get<StorageService>(StorageService);
    documentRepository = module.get<DocumentRepository>(DocumentRepository);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
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

    const determineHydrogenCompositionSpy = jest
      .spyOn(hydrogenCompositionService, 'determineHydrogenComposition')
      .mockResolvedValue([HydrogenCompositionEntityMock[0]]);

    const processBottlingForAllColorsSpy = jest
      .spyOn(batchSelectionService, 'processBottlingForAllColors')
      .mockReturnValue({
        batchesForBottle: [expectedResponse.batch],
        processStepsForRemainingAmount: [],
      });

    const createBottlingProcessStepSpy = jest
      .spyOn(processStepAssemblerService, 'createBottlingProcessStep')
      .mockResolvedValue(ProcessStepEntityHydrogenBottlingMock[0]);

    const readProcessStepSpy = jest.spyOn(processStepService, 'readProcessStep').mockResolvedValue(expectedResponse);

    const setBatchesInactiveSpy = jest.spyOn(batchRepository, 'setBatchesInactive');
    const insertProcessStepSpy = jest.spyOn(processStepRepository, 'insertProcessStep');
    const uploadSpy = jest.spyOn(storageService, 'uploadFileWithDeepPath');
    const addDocSpy = jest.spyOn(documentRepository, 'addDocumentToProcessStep');

    const actualResponse = await controller.createHydrogenBottlingProcessStep({
      processStepEntity: givenProcessStep,
      files: [],
    });

    expect(findAllProcessStepsFromStorageUnitSpy).toHaveBeenCalledWith(givenProcessStep.executedBy.id);
    expect(determineHydrogenCompositionSpy).toHaveBeenCalledTimes(1);
    expect(processBottlingForAllColorsSpy).toHaveBeenCalledTimes(1);
    expect(setBatchesInactiveSpy).toHaveBeenCalledWith([expectedResponse.batch.id]);
    expect(insertProcessStepSpy).toHaveBeenCalledTimes(0);
    expect(createBottlingProcessStepSpy).toHaveBeenCalledWith(givenProcessStep, [expectedResponse.batch]);
    expect(uploadSpy).toHaveBeenCalledTimes(0);
    expect(addDocSpy).toHaveBeenCalledTimes(0);
    expect(readProcessStepSpy).toHaveBeenCalledTimes(1);
    expect(readProcessStepSpy).toHaveBeenCalledWith(expectedResponse.id);
    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should calculate hydrogen composition', async () => {
    const givenBottlingProcessStep = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    givenBottlingProcessStep.batch.predecessors = [BatchEntityHydrogenProducedMock[0]];

    const readProcessStepSpy = jest
      .spyOn(processStepService, 'readProcessStep')
      .mockResolvedValue(givenBottlingProcessStep);

    const expectedResponse = HydrogenComponentAssembler.assembleFromBottlingProcessStep(givenBottlingProcessStep);
    const actualResponse = await controller.calculateHydrogenComposition(givenBottlingProcessStep.id);

    expect(readProcessStepSpy).toHaveBeenCalledWith(givenBottlingProcessStep.id);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
