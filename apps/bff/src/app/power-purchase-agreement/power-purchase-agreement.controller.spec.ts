/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { BrokerQueues } from '@h2-trust/messaging';
import { PowerPurchaseAgreementController } from './power-purchase-agreement.controller';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';
import { UserService } from '../user/user.service';

describe('PowerPurchaseAgreementController', () => {
  let controller: PowerPurchaseAgreementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PowerPurchaseAgreementController],
      providers: [
        PowerPurchaseAgreementService,
        UserService,
        {
          provide: BrokerQueues.QUEUE_GENERAL_SVC,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PowerPurchaseAgreementController>(PowerPurchaseAgreementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
