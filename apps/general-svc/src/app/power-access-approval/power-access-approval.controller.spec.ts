/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PowerAccessApprovalEntity, UserEntityHydrogenMock, UserEntityPowerMock } from '@h2-trust/amqp';
import {
  DatabaseModule,
  PowerAccessApprovalDbType,
  PowerAccessApprovalDbTypeMock,
  PrismaService,
  UserRepository,
} from '@h2-trust/database';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { PowerAccessApprovalController } from './power-access-approval.controller';
import { PowerAccessApprovalService } from './power-access-approval.service';

describe('PowerAccessApprovalController', () => {
  let controller: PowerAccessApprovalController;
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [PowerAccessApprovalController],
      providers: [PowerAccessApprovalService],
    })
      .overrideProvider(UserRepository)
      .useValue({
        findUser: jest.fn().mockResolvedValue(UserEntityHydrogenMock),
      })
      .overrideProvider(PrismaService)
      .useValue({
        powerAccessApproval: {
          findMany: jest.fn(),
        },
      })
      .compile();

    controller = module.get(PowerAccessApprovalController);
    userRepository = module.get(UserRepository);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get power access approvals ', async () => {
    const mockedPowerAccessApprovals: PowerAccessApprovalDbType[] = PowerAccessApprovalDbTypeMock;

    jest.spyOn(prismaService.powerAccessApproval, 'findMany').mockResolvedValue(mockedPowerAccessApprovals);

    const actualResponse: PowerAccessApprovalEntity[] = await controller.findAll({
      userId: UserEntityPowerMock.id,
      powerAccessApprovalStatus: PowerAccessApprovalStatus.APPROVED,
    });

    expect(userRepository.findUser).toHaveBeenCalledTimes(1);
    expect(prismaService.powerAccessApproval.findMany).toHaveBeenCalledTimes(1);
    expect(actualResponse).toBeDefined();
    expect(actualResponse.length).toBe(mockedPowerAccessApprovals.length);
  });
});
