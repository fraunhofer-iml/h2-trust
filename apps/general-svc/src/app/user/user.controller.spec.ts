/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UserEntity } from '@h2-trust/amqp';
import {
  DatabaseModule,
  PrismaService,
  UserDeepDbType,
  UserDeepDbTypeMock,
  userDeepQueryArgs,
} from '@h2-trust/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get an user and hist company by ID', async () => {
    const mockedUsers: UserDeepDbType[] = UserDeepDbTypeMock;

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockedUsers[0]);

    const expectedResponse: UserEntity = UserEntity.fromDeepDatabase(mockedUsers[0]);
    const actualResponse = await controller.readUserWithCompany({ id: expectedResponse.id });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: mockedUsers[0].id,
      },
      ...userDeepQueryArgs,
    });
    expect(actualResponse).toEqual(expectedResponse);
  });
});
