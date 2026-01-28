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
  ProcessStepEntity,
  ProcessStepEntityHydrogenBottlingMock,
  ProcessStepMessagePatterns,
} from '@h2-trust/amqp';
import {
  AuthenticatedUserMock,
  BottlingDto,
  BottlingDtoMock,
  BottlingOverviewDto,
  UserDetailsDtoMock,
} from '@h2-trust/api';
import 'multer';
import { of } from 'rxjs';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

describe('BottlingController', () => {
  let controller: BottlingController;
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
          provide: BrokerQueues.QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BottlingController>(BottlingController);
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

    const processSvcSpy = jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(returnedProcessStep));

    const expectedBatchSvcPayload1 = {
      amount: givenDto.amount,
      ownerId: givenDto.recipient,
      filledAt: new Date(givenDto.filledAt),
      recordedById: AuthenticatedUserMock.sub,
      hydrogenStorageUnitId: givenDto.hydrogenStorageUnit,
      color: givenDto.color,
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
    const actualResponse: BottlingOverviewDto = await controller.createBottlingAndTransportation(
      givenDto,
      [],
      AuthenticatedUserMock,
    );

    expect(processSvcSpy).toHaveBeenCalledTimes(2);
    expect(processSvcSpy).toHaveBeenNthCalledWith(
      1,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_BOTTLING,
      expectedBatchSvcPayload1,
    );
    expect(processSvcSpy).toHaveBeenNthCalledWith(
      2,
      ProcessStepMessagePatterns.CREATE_HYDROGEN_TRANSPORTATION,
      expectedBatchSvcPayload2,
    );

    expect(actualResponse).toEqual(expectedResponse);
  });
});
