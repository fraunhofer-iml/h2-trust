/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { PowerPurchaseAgreementEntity } from '@h2-trust/contracts/entities';
import { PowerPurchaseAgreementEntityFixture, UserEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { DatabaseModule, PowerPurchaseAgreementRepository, UserRepository } from '@h2-trust/database';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { PowerPurchaseAgreementController } from './power-purchase-agreement.controller';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

describe('PowerPurchaseAgreementController', () => {
  let controller: PowerPurchaseAgreementController;
  let userRepository: UserRepository;
  let powerPurchaseAgreementRepository: PowerPurchaseAgreementRepository;

  beforeEach(async () => {
    const user = UserEntityFixture.createPowerUser();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [PowerPurchaseAgreementController],
      providers: [PowerPurchaseAgreementService],
    })
      .overrideProvider(UserRepository)
      .useValue({
        findUser: jest.fn().mockResolvedValue(user),
      })
      .overrideProvider(PowerPurchaseAgreementRepository)
      .useValue({
        findAllPowerPurchaseAgreements: jest.fn(),
      })
      .compile();

    controller = module.get(PowerPurchaseAgreementController);
    userRepository = module.get(UserRepository);
    powerPurchaseAgreementRepository = module.get(PowerPurchaseAgreementRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get power purchase agreements ', async () => {
    const user = UserEntityFixture.createPowerUser();
    const mockedPurchaseAgreements: PowerPurchaseAgreementEntity[] = [PowerPurchaseAgreementEntityFixture.create()];

    jest
      .spyOn(powerPurchaseAgreementRepository, 'findAllPowerPurchaseAgreements')
      .mockResolvedValue(mockedPurchaseAgreements);

    const actualResponse: PowerPurchaseAgreementEntity[] = await controller.findAll({
      userId: user.id,
      powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus.APPROVED,
    });

    expect(userRepository.findUser).toHaveBeenCalledTimes(1);
    expect(userRepository.findUser).toHaveBeenCalledWith(user.id);
    expect(powerPurchaseAgreementRepository.findAllPowerPurchaseAgreements).toHaveBeenCalledTimes(1);
    expect(powerPurchaseAgreementRepository.findAllPowerPurchaseAgreements).toHaveBeenCalledWith(
      user.company.id,
      PowerPurchaseAgreementStatus.APPROVED,
      undefined,
    );
    expect(actualResponse).toBeDefined();
    expect(actualResponse.length).toBe(mockedPurchaseAgreements.length);
  });
});
