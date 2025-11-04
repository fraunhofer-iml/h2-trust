/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CompanyEntity } from '@h2-trust/amqp';
import { CompanyDbType, CompanyDbTypeMock, DatabaseModule, PrismaService } from '@h2-trust/database';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

describe('CompanyController', () => {
  let controller: CompanyController;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [CompanyController],
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            company: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get companies ', async () => {
    const mockedCompanies: CompanyDbType[] = CompanyDbTypeMock;

    jest.spyOn(prismaService.company, 'findMany').mockResolvedValue(mockedCompanies);

    const expectedResponse: CompanyEntity[] = mockedCompanies.map(CompanyEntity.fromDatabase);
    const actualResponse: CompanyEntity[] = await controller.findAll();

    expect(prismaService.company.findMany).toHaveBeenCalledTimes(1);
    expect(actualResponse.length).toEqual(expectedResponse.length);
    expect(actualResponse).toEqual(expectedResponse);
  });
});
