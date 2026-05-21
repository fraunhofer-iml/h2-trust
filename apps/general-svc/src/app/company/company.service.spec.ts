/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CompanyEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { CompanyRepository } from '@h2-trust/database';
import { CompanyService } from './company.service';

describe('CompanyService', () => {
  let service: CompanyService;

  const repositoryMock = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: CompanyRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to CompanyRepository when finding all companies', async () => {
      // arrange
      const expectedCompanies = [CompanyEntityFixture.createPowerProducer(), CompanyEntityFixture.createHydrogenProducer()];

      repositoryMock.findAll.mockResolvedValue(expectedCompanies);

      // act
      const actualResult = await service.findAll();

      // assert
      expect(repositoryMock.findAll).toHaveBeenCalled();
      expect(actualResult).toEqual(expectedCompanies);
    });
  });
});