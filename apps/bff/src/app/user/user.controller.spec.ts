/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserDetailsDtoFixture } from '@h2-trust/contracts/dtos/fixtures';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const userServiceMock = {
    readUserWithCompany: jest.fn(),
  };

  beforeEach(() => {
    controller = new UserController(userServiceMock as unknown as UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate readUserWithCompany to UserService when handling a user details request', async () => {
    // arrange
    const expectedUser = UserDetailsDtoFixture.create({ id: 'user-id-1' });

    userServiceMock.readUserWithCompany.mockResolvedValue(expectedUser);

    // act
    const actualResult = await controller.readUserWithCompany(expectedUser.id);

    // assert
    expect(actualResult).toEqual(expectedUser);
    expect(userServiceMock.readUserWithCompany).toHaveBeenCalledWith(expectedUser.id);
  });
});