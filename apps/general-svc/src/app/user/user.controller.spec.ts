/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CompanyType } from '@prisma/client';
import { DatabaseModule, PrismaService, userWithCompanyResultFields } from '@h2-trust/database';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get an user and hist company by ID', async () => {
    const expectedResponse = {
      id: 'user-power-1',
      name: 'Petra Power',
      email: 'petra@power.de',
      companyId: 'company-power-1',
      company: {
        id: 'company-power-1',
        name: 'PowerGen AG',
        mastrNumber: 'P12345',
        companyType: CompanyType.POWER_PRODUCER,
        addressId: {
          id: 'address-power-1',
          street: 'Energieweg 1',
          postalCode: '12345',
          city: 'Energietown',
          state: 'Energieland',
          country: 'Energieland',
        },
      },
    };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(expectedResponse);

    const actualResponse = await controller.readUserWithCompany({ id: expectedResponse.id });

    expect(actualResponse).toEqual(expectedResponse);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: expectedResponse.id,
      },
      ...userWithCompanyResultFields,
    });
  });
});
