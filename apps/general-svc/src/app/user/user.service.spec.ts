/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Test, TestingModule } from '@nestjs/testing';
import { UserEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { ReadByIdPayload } from '@h2-trust/contracts/payloads';
import { UserRepository } from '@h2-trust/database';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const repositoryMock = {
    findUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('readUserWithCompany', () => {
    it('should delegate to UserRepository when reading a user by payload id', async () => {
      // arrange
      const givenPayload = new ReadByIdPayload('user-1');
      const expectedUser = UserEntityFixture.createHydrogenUser({ id: givenPayload.id });

      repositoryMock.findUser.mockResolvedValue(expectedUser);

      // act
      const actualResult = await service.readUserWithCompany(givenPayload);

      // assert
      expect(repositoryMock.findUser).toHaveBeenCalledWith(givenPayload.id);
      expect(actualResult).toEqual(expectedUser);
    });
  });
});
