/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ProductionIntervallRepository } from '@h2-trust/database';
import { ProductionIntervallCleanupService } from './production-intervall-cleanup.service';

describe('ProductionIntervallCleanupService', () => {
  let service: ProductionIntervallCleanupService;
  let productionIntervallRepo: ProductionIntervallRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionIntervallCleanupService,
        {
          provide: ProductionIntervallRepository,
          useValue: {
            deleteOldIntervalls: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductionIntervallCleanupService>(ProductionIntervallCleanupService);
    productionIntervallRepo = module.get<ProductionIntervallRepository>(ProductionIntervallRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
