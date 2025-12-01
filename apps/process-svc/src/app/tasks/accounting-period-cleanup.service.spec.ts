/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AccountingPeriodRepository } from '@h2-trust/database';
import { AccountingPeriodCleanupService } from './accounting-period-cleanup.service';

describe('AccountingPeriodCleanupService', () => {
  let service: AccountingPeriodCleanupService;
  let accountingPeriodRepo: AccountingPeriodRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingPeriodCleanupService,
        {
          provide: AccountingPeriodRepository,
          useValue: {
            deleteExpiredAccountingPeriods: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AccountingPeriodCleanupService>(AccountingPeriodCleanupService);
    accountingPeriodRepo = module.get<AccountingPeriodRepository>(AccountingPeriodRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
