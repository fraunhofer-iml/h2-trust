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
  HydrogenCompositionEntityMock,
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepMessagePatterns,
  ReadByIdPayload,
  RedComplianceMessagePatterns,
} from '@h2-trust/amqp';
import {
  AuthenticatedUserMock,
  BottlingDto,
  BottlingDtoMock,
  BottlingOverviewDto,
  GeneralInformationDto,
  RedComplianceDtoMock,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import 'multer';
import { of } from 'rxjs';
import { ProcessType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

describe('BottlingController', () => {
  let controller: BottlingController;
  let batchSvc: ClientProxy;
  let processSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BottlingController],
      providers: [
        BottlingService,
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
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BottlingController>(BottlingController);
    batchSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_BATCH_SVC) as ClientProxy;
    processSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_PROCESS_SVC) as ClientProxy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a bottling and transportation batch', async () => {
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
      distance: givenDto.distance,
      transportMode: givenDto.transportMode,
      fuelType: givenDto.fuelType,
    };

    const expectedResponse: BottlingOverviewDto = BottlingOverviewDto.fromEntity(returnedProcessStep);
    const actualResponse: BottlingOverviewDto = await controller.createBottlingAndTransportation(givenDto, [], AuthenticatedUserMock);

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
    const actualResponse: BottlingOverviewDto[] = await controller.readBottlingsAndTransportationsByCompany(AuthenticatedUserMock);

    expect(batchSvcSpy).toHaveBeenCalledTimes(1);
    expect(batchSvcSpy).toHaveBeenCalledWith(
      ProcessStepMessagePatterns.READ_ALL_BY_TYPES_AND_ACTIVE_AND_COMPANY,
      expectedBatchSvcPayload,
    );

    expect(actualResponse).toEqual(expectedResponse);
  });

  xit('should read general information', async () => {
    const processStepFixture = structuredClone(ProcessStepEntityHydrogenBottlingMock[0]);
    const hydrogenCompositionFixture = HydrogenCompositionEntityMock.map((hc) => structuredClone(hc));

    const batchSvcSpy = jest
      .spyOn(batchSvc, 'send')
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(processStepFixture))
      .mockImplementationOnce((_messagePattern: ProcessStepMessagePatterns, _data: any) => of(hydrogenCompositionFixture));

    const processSvcSpy = jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern: RedComplianceMessagePatterns, _data: any) => of(RedComplianceDtoMock[0]));

    const expectedBatchSvcPayload1 = new ReadByIdPayload(processStepFixture.id);
    const expectedBatchSvcPayload2 = new ReadByIdPayload(processStepFixture.id);
    const expectedProcessSvcPayload = new ReadByIdPayload(processStepFixture.id);

    const expectedResponse: GeneralInformationDto = {
      ...GeneralInformationDto.fromEntityToDto(processStepFixture),
      hydrogenComposition: hydrogenCompositionFixture,
      producer: UserDetailsDtoMock[0].company.name,
      redCompliance: RedComplianceDtoMock[0],
    };
    const actualResponse: GeneralInformationDto = await controller.readGeneralInformation(processStepFixture.id);

    expect(batchSvcSpy).toHaveBeenCalledTimes(2);
    expect(batchSvcSpy).toHaveBeenNthCalledWith(1, ProcessStepMessagePatterns.READ_UNIQUE, expectedBatchSvcPayload1);
    expect(batchSvcSpy).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CALCULATE_HYDROGEN_COMPOSITION,
      expectedBatchSvcPayload2,
    );

    expect(processSvcSpy).toHaveBeenCalledTimes(1);
    expect(processSvcSpy).toHaveBeenCalledWith(RedComplianceMessagePatterns.DETERMINE, expectedProcessSvcPayload);

    expect(actualResponse).toEqual(expectedResponse);
  });
});
