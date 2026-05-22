/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { UserDetailsDto } from '@h2-trust/contracts/dtos';
import { UserEntityFixture } from '@h2-trust/contracts/entities/fixtures';
import { ReadByIdPayload } from '@h2-trust/contracts/payloads';
import { UserMessagePatterns } from '@h2-trust/messaging';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;

  const generalServiceMock = {
    send: jest.fn(),
  };

  beforeEach(() => {
    service = new UserService(generalServiceMock as unknown as ClientProxy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should request the user by id and map the response when reading a user with company', async () => {
    // arrange
    const expectedUser = UserEntityFixture.createPowerUser({ id: 'user-id-1' });

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(expectedUser));

    // act
    const actualResult: UserDetailsDto = await service.readUserWithCompany(expectedUser.id);

    // assert
    expect(generalServiceMock.send).toHaveBeenCalledWith(
      UserMessagePatterns.READ,
      new ReadByIdPayload(expectedUser.id),
    );
    expect(actualResult).toEqual(UserDetailsDto.fromEntity(expectedUser));
  });
});
