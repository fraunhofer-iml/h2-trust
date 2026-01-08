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
import { BrokerQueues, ReadByIdPayload, UserEntity, UserEntityPowerMock, UserMessagePatterns } from '@h2-trust/amqp';
import { UserDetailsDto } from '@h2-trust/api';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let generalSvc: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    generalSvc = module.get<ClientProxy>(BrokerQueues.QUEUE_GENERAL_SVC) as ClientProxy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('readUserWithCompany should request user and map dto', async () => {
    const mockedUser: UserEntity = UserEntityPowerMock;
    const expectedResponse = UserDetailsDto.fromEntity(mockedUser);

    const generalServiceSpy = jest
      .spyOn(generalSvc, 'send')
      .mockImplementation((_messagePattern, _data) => of(mockedUser));

    const actualResponse = await controller.readUserWithCompany(mockedUser.id);

    expect(generalServiceSpy).toHaveBeenCalledTimes(1);
    expect(generalServiceSpy).toHaveBeenCalledWith(UserMessagePatterns.READ, new ReadByIdPayload(mockedUser.id));
    expect(actualResponse).toEqual(expectedResponse);
  });
});
