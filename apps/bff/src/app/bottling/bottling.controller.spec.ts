/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { BottlingDto, BottlingOverviewDto, type AuthenticatedKCUser } from '@h2-trust/contracts/dtos';
import { BottlingDtoFixture, UserDetailsDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { ProcessStepEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { ProcessStepMessagePatterns, QUEUE_PROCESS_SVC } from '@h2-trust/messaging';
import 'multer';
import { of } from 'rxjs';
import { RfnboType } from '@h2-trust/domain';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

describe('BottlingController', () => {
  let controller: BottlingController;
  let processSvc: ClientProxy;
  const authenticatedUser: AuthenticatedKCUser = { sub: 'user-id-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [BottlingController],
      providers: [
        BottlingService,
        {
          provide: UserService,
          useValue: {
            readUserWithCompany: jest.fn().mockResolvedValue(UserDetailsDtoFixture.create()),
          },
        },
        {
          provide: QUEUE_PROCESS_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BottlingController>(BottlingController);
    processSvc = module.get<ClientProxy>(QUEUE_PROCESS_SVC) as ClientProxy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a bottling and transportation batch', async () => {
    const givenDto: BottlingDto = BottlingDtoFixture.create();
    const processStepFixture = ProcessStepEntityFixture.createHydrogenBottling({
      startedAt: new Date(givenDto.filledAt),
      endedAt: new Date(givenDto.filledAt),
    });

    const processSvcSpy = jest
      .spyOn(processSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(processStepFixture));

    const expectedBatchSvcPayload1 = {
      amount: givenDto.amount,
      ownerId: givenDto.recipient,
      filledAt: new Date(givenDto.filledAt),
      recordedById: authenticatedUser.sub,
      hydrogenStorageUnitId: givenDto.hydrogenStorageUnit,
      files: [] as Express.Multer.File[],
      rfnboType: RfnboType.RFNBO_READY,
    };

    const expectedBatchSvcPayload2 = {
      processStep: processStepFixture,
      predecessorBatch: processStepFixture.batch,
      distance: givenDto.distance,
      transportMode: givenDto.transportMode,
      fuelType: givenDto.fuelType,
    };

    const expectedResponse: BottlingOverviewDto = BottlingOverviewDto.fromEntity(processStepFixture);
    const actualResponse: BottlingOverviewDto = await controller.createBottlingAndTransportation(
      givenDto,
      [],
      authenticatedUser,
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
