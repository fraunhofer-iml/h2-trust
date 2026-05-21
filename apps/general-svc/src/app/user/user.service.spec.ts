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
    it('delegates to UserRepository with the payload id', async () => {
      const payload = new ReadByIdPayload('user-1');
      const user = UserEntityFixture.createHydrogenUser({ id: payload.id });

      repositoryMock.findUser.mockResolvedValue(user);

      const actualResult = await service.readUserWithCompany(payload);

      expect(repositoryMock.findUser).toHaveBeenCalledWith(payload.id);
      expect(actualResult).toEqual(user);
    });
  });
});