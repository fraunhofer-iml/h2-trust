/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { UserEntity } from '@h2-trust/contracts/entities';
import { ReadByIdPayload } from '@h2-trust/contracts/payloads';
import { UserRepository } from '@h2-trust/database';

@Injectable()
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async readUserWithCompany(payload: ReadByIdPayload): Promise<UserEntity> {
    return this.repository.findUser(payload.id);
  }
}
