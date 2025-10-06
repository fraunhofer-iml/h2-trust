/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityHydrogenProductionMock,
  ProcessStepEntityHydrogenTransportationMock,
  ProcessStepEntityPowerProductionMock,
} from '@h2-trust/amqp';
import { SectionDto } from '@h2-trust/api';
import 'multer';
import { HydrogenProductionSectionAssembler } from './assembler/hydrogen-production-section.assembler';
import { ProofOfOriginConstants } from './proof-of-origin.constants';
import { ProofOfOriginService } from './proof-of-origin.service';
import { ProcessLineageService } from './retrieval/process-lineage.service';
import { ProcessStepService } from './retrieval/process-step.service';
import { BottlingSectionService } from './sections/bottling-section.service';
import { InputMediaSectionService } from './sections/input-media-section.service';

describe('ProofOfOriginService', () => {
  let proofOfOriginService: ProofOfOriginService;
  let processStepService: ProcessStepService;
  let processLineageService: ProcessLineageService;
  let bottlingSectionService: BottlingSectionService;
  let inputMediaSectionService: InputMediaSectionService;

  let hydrogenTransportationProcessStep: ProcessStepEntity;
  let hydrogenBottlingProcessStep: ProcessStepEntity;
  let hydrogenProductionProcessStep: ProcessStepEntity;
  let powerProductionProcessStep: ProcessStepEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [
        ProofOfOriginService,
        {
          provide: ProcessStepService,
          useValue: {
            fetchProcessStep: jest.fn(),
          },
        },
        {
          provide: ProcessLineageService,
          useValue: {
            fetchPowerProductionProcessSteps: jest.fn(),
            fetchHydrogenProductionProcessSteps: jest.fn(),
            fetchHydrogenBottlingProcessStep: jest.fn(),
          },
        },
        {
          provide: BottlingSectionService,
          useValue: {
            buildBottlingSection: jest.fn(),
            buildTransportationSection: jest.fn(),
          },
        },
        {
          provide: InputMediaSectionService,
          useValue: {
            buildInputMediaSection: jest.fn(),
          },
        },
        {
          provide: BrokerQueues.QUEUE_BATCH_SVC,
          useValue: {
            send: jest.fn(),
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

    proofOfOriginService = module.get<ProofOfOriginService>(ProofOfOriginService);
    bottlingSectionService = module.get<BottlingSectionService>(BottlingSectionService);
    processStepService = module.get<ProcessStepService>(ProcessStepService);
    inputMediaSectionService = module.get<InputMediaSectionService>(InputMediaSectionService);
    processLineageService = module.get<ProcessLineageService>(ProcessLineageService);

    hydrogenTransportationProcessStep = structuredClone(ProcessStepEntityHydrogenTransportationMock[0]);
    hydrogenBottlingProcessStep = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    hydrogenProductionProcessStep = structuredClone(ProcessStepEntityHydrogenProductionMock[0]);
    powerProductionProcessStep = structuredClone(ProcessStepEntityPowerProductionMock[0]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(proofOfOriginService).toBeDefined();
  });

  it('should return proof of origin for process step ProcessType.POWER_PRODUCTION', async () => {
    const expectedResponse: SectionDto[] = [
      { name: ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, batches: [], classifications: [] },
    ];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStep')
      .mockResolvedValue(powerProductionProcessStep);

    const inputMediaSectionServiceSpy = jest
      .spyOn(inputMediaSectionService, 'buildInputMediaSection')
      .mockResolvedValue(expectedResponse[0]);

    const actualResponse = await proofOfOriginService.readProofOfOrigin(powerProductionProcessStep.id);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepServiceSpy).toHaveBeenCalledWith(powerProductionProcessStep.id);

    expect(inputMediaSectionServiceSpy).toHaveBeenCalledTimes(1);
    expect(inputMediaSectionServiceSpy).toHaveBeenCalledWith([powerProductionProcessStep]);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return proof of origin for process step ProcessType.HYDROGEN_PRODUCTION', async () => {
    const expectedResponse: SectionDto[] = [
      { name: ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, batches: [], classifications: [] },
      { name: ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME, batches: [], classifications: [] },
    ];

    const processStepServiceSpy = jest
      .spyOn(processStepService, 'fetchProcessStep')
      .mockResolvedValue(hydrogenProductionProcessStep);

    const processLineageServiceSpy = jest
      .spyOn(processLineageService, 'fetchPowerProductionProcessSteps')
      .mockResolvedValue([powerProductionProcessStep]);

    const inputMediaSectionServiceSpy = jest
      .spyOn(inputMediaSectionService, 'buildInputMediaSection')
      .mockResolvedValue(expectedResponse[0]);

    const hydrogenProductionSectionServiceSpy = jest
      .spyOn(HydrogenProductionSectionAssembler, 'buildHydrogenProductionSection')
      .mockReturnValue(expectedResponse[1]);

    const actualResponse = await proofOfOriginService.readProofOfOrigin(hydrogenProductionProcessStep.id);

    expect(processStepServiceSpy).toHaveBeenCalledTimes(1);
    expect(processStepServiceSpy).toHaveBeenCalledWith(hydrogenProductionProcessStep.id);

    expect(processLineageServiceSpy).toHaveBeenCalledTimes(1);
    expect(processLineageServiceSpy).toHaveBeenCalledWith([hydrogenProductionProcessStep]);

    expect(inputMediaSectionServiceSpy).toHaveBeenCalledTimes(1);
    expect(inputMediaSectionServiceSpy).toHaveBeenCalledWith([powerProductionProcessStep]);

    expect(hydrogenProductionSectionServiceSpy).toHaveBeenCalledTimes(1);
    expect(hydrogenProductionSectionServiceSpy).toHaveBeenCalledWith([hydrogenProductionProcessStep]);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return proof of origin for process step ProcessType.HYDROGEN_BOTTLING', async () => {
    const expectedResponse: SectionDto[] = [
      { name: ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, batches: [], classifications: [] },
      { name: ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME, batches: [], classifications: [] },
      { name: ProofOfOriginConstants.HYDROGEN_BOTTLING_SECTION_NAME, batches: [], classifications: [] },
    ];

    const fetchProcessStepSpy = jest
      .spyOn(processStepService, 'fetchProcessStep')
      .mockResolvedValue(hydrogenBottlingProcessStep);

    const fetchHydrogenProductionStepsSpy = jest
      .spyOn(processLineageService, 'fetchHydrogenProductionProcessSteps')
      .mockResolvedValue([hydrogenProductionProcessStep]);

    const fetchPowerProductionStepsSpy = jest
      .spyOn(processLineageService, 'fetchPowerProductionProcessSteps')
      .mockResolvedValue([powerProductionProcessStep]);

    const buildInputMediaSectionSpy = jest
      .spyOn(inputMediaSectionService, 'buildInputMediaSection')
      .mockResolvedValue(expectedResponse[0]);

    const buildBottlingSectionSpy = jest
      .spyOn(bottlingSectionService, 'buildBottlingSection')
      .mockResolvedValue(expectedResponse[2]);

    const buildHydrogenProductionSectionSpy = jest
      .spyOn(HydrogenProductionSectionAssembler, 'buildHydrogenProductionSection')
      .mockReturnValue(expectedResponse[1]);

    const actualResponse = await proofOfOriginService.readProofOfOrigin(hydrogenBottlingProcessStep.id);

    expect(fetchProcessStepSpy).toHaveBeenCalledTimes(1);
    expect(fetchProcessStepSpy).toHaveBeenCalledWith(hydrogenBottlingProcessStep.id);

    expect(fetchHydrogenProductionStepsSpy).toHaveBeenCalledTimes(1);
    expect(fetchHydrogenProductionStepsSpy).toHaveBeenCalledWith(hydrogenBottlingProcessStep);

    expect(fetchPowerProductionStepsSpy).toHaveBeenCalledTimes(1);
    expect(fetchPowerProductionStepsSpy).toHaveBeenCalledWith([hydrogenProductionProcessStep]);

    expect(buildInputMediaSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildInputMediaSectionSpy).toHaveBeenCalledWith([powerProductionProcessStep]);

    expect(buildBottlingSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildBottlingSectionSpy).toHaveBeenCalledWith(hydrogenBottlingProcessStep);

    expect(buildHydrogenProductionSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildHydrogenProductionSectionSpy).toHaveBeenCalledWith([hydrogenProductionProcessStep]);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return proof of origin for process step ProcessType.HYDROGEN_TRANSPORTATION', async () => {
    const expectedResponse: SectionDto[] = [
      { name: ProofOfOriginConstants.INPUT_MEDIA_SECTION_NAME, batches: [], classifications: [] },
      { name: ProofOfOriginConstants.HYDROGEN_PRODUCTION_SECTION_NAME, batches: [], classifications: [] },
      { name: ProofOfOriginConstants.HYDROGEN_BOTTLING_SECTION_NAME, batches: [], classifications: [] },
      { name: ProofOfOriginConstants.HYDROGEN_TRANSPORTATION_SECTION_NAME, batches: [], classifications: [] },
    ];

    const fetchProcessStepSpy = jest
      .spyOn(processStepService, 'fetchProcessStep')
      .mockResolvedValue(hydrogenTransportationProcessStep);

    const fetchHydrogenBottlingProcessStepSpy = jest
      .spyOn(processLineageService, 'fetchHydrogenBottlingProcessStep')
      .mockResolvedValue(hydrogenBottlingProcessStep);

    const fetchHydrogenProductionProcessStepsSpy = jest
      .spyOn(processLineageService, 'fetchHydrogenProductionProcessSteps')
      .mockResolvedValue([hydrogenProductionProcessStep]);

    const fetchPowerProductionProcessStepsSpy = jest
      .spyOn(processLineageService, 'fetchPowerProductionProcessSteps')
      .mockResolvedValue([powerProductionProcessStep]);

    const buildInputMediaSectionSpy = jest
      .spyOn(inputMediaSectionService, 'buildInputMediaSection')
      .mockResolvedValue(expectedResponse[0]);

    const buildBottlingSectionSpy = jest
      .spyOn(bottlingSectionService, 'buildBottlingSection')
      .mockResolvedValue(expectedResponse[2]);

    const buildTransportationSectionSpy = jest
      .spyOn(bottlingSectionService, 'buildTransportationSection')
      .mockResolvedValue(expectedResponse[3]);

    const buildHydrogenProductionSectionSpy = jest
      .spyOn(HydrogenProductionSectionAssembler, 'buildHydrogenProductionSection')
      .mockReturnValue(expectedResponse[1]);

    const actualResponse = await proofOfOriginService.readProofOfOrigin(hydrogenTransportationProcessStep.id);

    expect(fetchProcessStepSpy).toHaveBeenCalledTimes(1);
    expect(fetchProcessStepSpy).toHaveBeenCalledWith(hydrogenTransportationProcessStep.id);

    expect(fetchHydrogenBottlingProcessStepSpy).toHaveBeenCalledTimes(1);
    expect(fetchHydrogenBottlingProcessStepSpy).toHaveBeenCalledWith(hydrogenTransportationProcessStep);

    expect(fetchHydrogenProductionProcessStepsSpy).toHaveBeenCalledTimes(1);
    expect(fetchHydrogenProductionProcessStepsSpy).toHaveBeenCalledWith(hydrogenBottlingProcessStep);

    expect(fetchPowerProductionProcessStepsSpy).toHaveBeenCalledTimes(1);
    expect(fetchPowerProductionProcessStepsSpy).toHaveBeenCalledWith([hydrogenProductionProcessStep]);

    expect(buildInputMediaSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildInputMediaSectionSpy).toHaveBeenCalledWith([powerProductionProcessStep]);

    expect(buildBottlingSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildBottlingSectionSpy).toHaveBeenCalledWith(hydrogenBottlingProcessStep);

    expect(buildTransportationSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildTransportationSectionSpy).toHaveBeenCalledWith(
      hydrogenTransportationProcessStep,
      hydrogenBottlingProcessStep,
    );

    expect(buildHydrogenProductionSectionSpy).toHaveBeenCalledTimes(1);
    expect(buildHydrogenProductionSectionSpy).toHaveBeenCalledWith([hydrogenProductionProcessStep]);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should throw for unsupported process type', async () => {
    powerProductionProcessStep.processType = 'UNSUPPORTED_TYPE' as any;

    jest.spyOn(processStepService, 'fetchProcessStep').mockResolvedValue(powerProductionProcessStep);

    await expect(proofOfOriginService.readProofOfOrigin(powerProductionProcessStep.id)).rejects.toMatchObject({
      message: expect.stringContaining('UNSUPPORTED_TYPE'),
    });

    expect(processStepService.fetchProcessStep).toHaveBeenCalledTimes(1);
    expect(processStepService.fetchProcessStep).toHaveBeenCalledWith(powerProductionProcessStep.id);
  });
});
