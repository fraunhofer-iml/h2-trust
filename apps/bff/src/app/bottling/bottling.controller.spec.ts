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
  ProcessStepMessagePatterns,
  ReadByIdPayload,
  UserMessagePatterns,
} from '@h2-trust/amqp';
import {
  AuthenticatedUserMock,
  BottlingDto,
  BottlingDtoMock,
  BottlingOverviewDto,
  GeneralInformationDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import 'multer';
import { of } from 'rxjs';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';
import { DigitalProductPassportService } from './digital-product-passport/digital-product-passport.service';
import { RedComplianceService } from './red-compliance/red-compliance.service';

describe('BottlingController', () => {
  let controller: BottlingController;
  let batchSvc: ClientProxy;
  let generalSvc: ClientProxy;
  let redComplianceService: RedComplianceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BottlingController],
      providers: [
        BottlingService,
        {
          provide: DigitalProductPassportService,
          useValue: {},
        },
        {
          provide: RedComplianceService,
          useValue: {
            determineRedCompliance: jest.fn(),
          },
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
        {
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BottlingController>(BottlingController);
    batchSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
    redComplianceService = module.get<RedComplianceService>(RedComplianceService);
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
      amount: givenDto.amount,
      ownerId: givenDto.recipient,
      filledAt: new Date(givenDto.filledAt),
      recordedById: AuthenticatedUserMock.sub,
      hydrogenStorageUnitId: givenDto.hydrogenStorageUnit,
      color: givenDto.color,
      fileDescription: givenDto.fileDescription,
      files: [] as Express.Multer.File[],
    };

    const expectedBatchSvcPayload2 = {
      processStep: returnedProcessStep,
      predecessorBatch: returnedProcessStep.batch,
      transportationDetails: {
        distance: givenDto.distance,
        transportMode: givenDto.transportMode,
        fuelType: givenDto.fuelType,
      },
    };

    const expectedResponse: BottlingOverviewDto = BottlingOverviewDto.fromEntity(returnedProcessStep);
    const actualResponse: BottlingOverviewDto = await controller.createBottling(givenDto, [], AuthenticatedUserMock);

    expect(batchSvcSpy).toHaveBeenCalledTimes(2);
    expect(batchSvcSpy).toHaveBeenNthCalledWith(
      1,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING,
      expectedBatchSvcPayload1,
    );
    expect(batchSvcSpy).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION,
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
    expect(batchSvcSpy).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY,
      expectedBatchSvcPayload,
    );

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

    const expectedBatchSvcPayload1 = ReadByIdPayload.of(returnedProcessStep.id);
    const expectedBatchSvcPayload2 = ReadByIdPayload.of(returnedProcessStep.id);
    const expectedGeneralSvcPayload = ReadByIdPayload.of(returnedProcessStep.recordedBy.id);

    const mockedRedCompliance = {
      isGeoCorrelationValid: true,
      isTimeCorrelationValid: true,
      isAdditionalityFulfilled: true,
      isFinancialSupportReceived: true,
    };
    jest.spyOn(redComplianceService, 'determineRedCompliance').mockResolvedValue(mockedRedCompliance as any);

    const expectedResponse: GeneralInformationDto = {
      ...GeneralInformationDto.fromEntityToDto(returnedProcessStep),
      hydrogenComposition: returnedHydrogenCompositions,
      producer: UserDetailsDtoMock[0].company.name,
      redCompliance: mockedRedCompliance as any,
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
});
