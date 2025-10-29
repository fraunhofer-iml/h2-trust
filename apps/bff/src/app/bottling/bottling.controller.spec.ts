/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BrokerQueues,
  HydrogenComponentEntity,
  HydrogenCompositionEntityMock,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepEntityPowerProductionMock,
  ProcessStepMessagePatterns,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  AuthenticatedUserMock,
  BottlingDto,
  BottlingDtoMock,
  BottlingOverviewDto,
  GeneralInformationDto,
  proofOfSustainabilityMock,
  SectionDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import 'multer';
import { of } from 'rxjs';
import { ProcessType, ProofOfOrigin } from '@h2-trust/domain';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';
import { ProofOfOriginService } from './proof-of-origin/proof-of-origin.service';
import { ProofOfSustainabilityService } from './proof-of-sustainability/proof-of-sustainability.service';

describe('BottlingController', () => {
  let controller: BottlingController;
  let proofOfOriginService: ProofOfOriginService;
  let batchSvc: ClientProxy;
  let generalSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BottlingController],
      providers: [
        BottlingService,
        {
          provide: ProofOfOriginService,
          useValue: { readProofOfOrigin: jest.fn() },
        },
        {
          provide: ProofOfSustainabilityService,
          useValue: { readProofOfSustainability: jest.fn().mockResolvedValue(proofOfSustainabilityMock) },
        },
        {
          provide: UserService,
          useValue: {
            readUserWithCompany: jest.fn().mockResolvedValue(UserDetailsDtoMock[0]),
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

    controller = module.get<BottlingController>(BottlingController);
    proofOfOriginService = module.get<ProofOfOriginService>(ProofOfOriginService);
    batchSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a bottling batch', async () => {
    const givenDto: BottlingDto = BottlingDtoMock[0];

    const returnedProcessStep: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    returnedProcessStep.startedAt = new Date(givenDto.filledAt);
    returnedProcessStep.endedAt = new Date(givenDto.filledAt);

    const batchSvcSpy = jest
      .spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(returnedProcessStep));

    const expectedBatchSvcPayload1 = {
      processStepEntity: BottlingDto.toEntity({ ...givenDto, recordedBy: AuthenticatedUserMock.sub }),
      files: [] as Express.Multer.File[],
    };

    const expectedBatchSvcPayload2 = {
      processStepEntity: {
        ...returnedProcessStep,
        transportationDetails: {
          id: undefined as string,
          distance: 100,
          transportMode: givenDto.transportMode,
          fuelType: givenDto.fuelType,
        },
      },
    };

    const expectedResponse: BottlingOverviewDto = BottlingOverviewDto.fromEntity(returnedProcessStep);
    const actualResponse: BottlingOverviewDto = await controller.createBottling(givenDto, [], AuthenticatedUserMock);

    expect(batchSvcSpy).toHaveBeenCalledTimes(2);
    expect(batchSvcSpy).toHaveBeenNthCalledWith(
      1,
      ProcessStepMessagePatterns.HYDROGEN_BOTTLING,
      expectedBatchSvcPayload1,
    );
    expect(batchSvcSpy).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.HYDROGEN_TRANSPORTATION,
      expectedBatchSvcPayload2,
    );

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read bottling batches', async () => {
    const returnedProcessSteps: ProcessStepEntity[] = ProcessStepEntityHydrogenBottlingMock.map((ps) =>
      structuredClone(ps),
    );

    const batchSvcSpy = jest
      .spyOn(batchSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(returnedProcessSteps));

    const expectedBatchSvcPayload = {
      processTypes: [ProcessType.HYDROGEN_BOTTLING, ProcessType.HYDROGEN_TRANSPORTATION],
      active: true,
      companyId: UserDetailsDtoMock[0].company.id,
    };

    const expectedResponse: BottlingOverviewDto[] = returnedProcessSteps.map(BottlingOverviewDto.fromEntity);
    const actualResponse: BottlingOverviewDto[] = await controller.readBottlingsByCompany(AuthenticatedUserMock);

    expect(batchSvcSpy).toHaveBeenCalledTimes(1);
    expect(batchSvcSpy).toHaveBeenCalledWith(ProcessStepMessagePatterns.READ_ALL, expectedBatchSvcPayload);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should read general information', async () => {
    const returnedProcessStep: ProcessStepEntity = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const returnedHydrogenCompositions: HydrogenComponentEntity[] = HydrogenCompositionEntityMock.map((hc) =>
      structuredClone(hc),
    );

    const batchSvcSpy = jest
      .spyOn(batchSvc, 'send')
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(returnedProcessStep))
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) =>
        of(returnedHydrogenCompositions),
      );

    const generalSvcSpy = jest
      .spyOn(generalSvc, 'send')
      .mockImplementation((_messagePattern: UserMessagePatterns, _data: any) => of(UserDetailsDtoMock[0]));

    const expectedBatchSvcPayload1 = { processStepId: returnedProcessStep.id };
    const expectedBatchSvcPayload2 = returnedProcessStep.id;
    const expectedGeneralSvcPayload = { id: returnedProcessStep.recordedBy.id };

    const expectedResponse: GeneralInformationDto = {
      ...GeneralInformationDto.fromEntityToDto(returnedProcessStep),
      hydrogenComposition: returnedHydrogenCompositions,
      producer: UserDetailsDtoMock[0].company.name,
    };
    const actualResponse: GeneralInformationDto = await controller.readGeneralInformation(returnedProcessStep.id);

    expect(batchSvcSpy).toHaveBeenCalledTimes(2);
    expect(batchSvcSpy).toHaveBeenNthCalledWith(1, ProcessStepMessagePatterns.READ_UNIQUE, expectedBatchSvcPayload1);
    expect(batchSvcSpy).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION,
      expectedBatchSvcPayload2,
    );

    expect(generalSvcSpy).toHaveBeenCalledTimes(1);
    expect(generalSvcSpy).toHaveBeenCalledWith(UserMessagePatterns.READ, expectedGeneralSvcPayload);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return proof of origin for process step ProcessType.POWER_PRODUCTION', async () => {
    const givenProcessStep: ProcessStepEntity = structuredClone(ProcessStepEntityPowerProductionMock[0]);
    const expectedResponse: SectionDto[] = [
      { name: ProofOfOrigin.HYDROGEN_PRODUCTION_SECTION_NAME, batches: [], classifications: [] },
    ];

    const proofOfOriginServiceSpy = jest
      .spyOn(proofOfOriginService, 'readProofOfOrigin')
      .mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readProofOfOrigin(givenProcessStep.id);

    expect(proofOfOriginServiceSpy).toHaveBeenCalledTimes(1);
    expect(proofOfOriginServiceSpy).toHaveBeenCalledWith(givenProcessStep.id);

    expect(actualResponse).toEqual(expectedResponse);
  });

  it('should return proof of sustainability for process step ID', async () => {
    const actualResponse = await controller.readProofOfSustainability('213');
    const expectedResponse = proofOfSustainabilityMock;
    expect(actualResponse).toEqual(expectedResponse);
  });
});
