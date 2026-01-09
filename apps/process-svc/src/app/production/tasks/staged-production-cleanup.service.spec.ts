/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { StagedProductionRepository } from '@h2-trust/database';
import { StagedProductionCleanupService } from './staged-production-cleanup.service';

describe('StagedProductionCleanupService', () => {
  let service: StagedProductionCleanupService;
  let repository: StagedProductionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StagedProductionCleanupService,
        {
          provide: StagedProductionRepository,
          useValue: {
            deleteExpiredStagedProductions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StagedProductionCleanupService>(StagedProductionCleanupService);
    repository = module.get<StagedProductionRepository>(StagedProductionRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
