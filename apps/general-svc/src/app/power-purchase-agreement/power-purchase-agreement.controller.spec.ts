/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PowerPurchaseAgreementEntity } from '@h2-trust/amqp';
import {
  DatabaseModule,
  PowerPurchaseAgreementDbTypeMock,
  PowerPurchaseAgreementDeepDbType,
  PrismaService,
  UserRepository,
} from '@h2-trust/database';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { UserEntityFixture } from '@h2-trust/fixtures';
import { PowerPurchaseAgreementController } from './power-purchase-agreement.controller';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

describe('PowerPurchaseAgreementController', () => {
  let controller: PowerPurchaseAgreementController;
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [PowerPurchaseAgreementController],
      providers: [PowerPurchaseAgreementService],
    })
      .overrideProvider(UserRepository)
      .useValue({
        findUser: jest.fn().mockResolvedValue(UserEntityFixture.createHydrogenUser()),
      })
      .overrideProvider(PrismaService)
      .useValue({
        powerPurchaseAgreement: {
          findMany: jest.fn(),
        },
      })
      .compile();

    controller = module.get(PowerPurchaseAgreementController);
    userRepository = module.get(UserRepository);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get power purchase aggrements ', async () => {
    const mockedPurchaseAgreements: PowerPurchaseAgreementDeepDbType[] = PowerPurchaseAgreementDbTypeMock;

    jest.spyOn(prismaService.powerPurchaseAgreement, 'findMany').mockResolvedValue(mockedPurchaseAgreements);

    const actualResponse: PowerPurchaseAgreementEntity[] = await controller.findAll({
      userId: UserEntityFixture.createPowerUser().id,
      powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus.APPROVED,
    });

    expect(userRepository.findUser).toHaveBeenCalledTimes(1);
    expect(prismaService.powerPurchaseAgreement.findMany).toHaveBeenCalledTimes(1);
    expect(actualResponse).toBeDefined();
    expect(actualResponse.length).toBe(mockedPurchaseAgreements.length);
  });
});
