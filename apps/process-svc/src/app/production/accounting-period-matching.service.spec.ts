/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AccountingPeriodMatchingService } from './accounting-period-matching.service';

describe('AccountingPeriodMatchingService', () => {
  let service: AccountingPeriodMatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingPeriodMatchingService],
    }).compile();

    service = module.get<AccountingPeriodMatchingService>(AccountingPeriodMatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
