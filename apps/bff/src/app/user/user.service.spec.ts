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

  it('readUserWithCompany should request the user by id and map the response', async () => {
    const user = UserEntityFixture.createPowerUser({ id: 'user-id-1' });

    generalServiceMock.send.mockImplementation((_pattern, _payload) => of(user));

    const actualResponse: UserDetailsDto = await service.readUserWithCompany(user.id);

    expect(generalServiceMock.send).toHaveBeenCalledWith(UserMessagePatterns.READ, new ReadByIdPayload(user.id));
    expect(actualResponse).toEqual(UserDetailsDto.fromEntity(user));
  });
});