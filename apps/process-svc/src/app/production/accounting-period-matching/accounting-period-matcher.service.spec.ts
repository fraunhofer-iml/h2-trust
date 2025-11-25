/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AccountingPeriodMatcherService } from './accounting-period-matcher.service';

describe('AccountingPeriodMatcherService', () => {
  let service: AccountingPeriodMatcherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountingPeriodMatcherService],
    }).compile();

    service = module.get<AccountingPeriodMatcherService>(AccountingPeriodMatcherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
