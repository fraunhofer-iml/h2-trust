/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserDetailsEntity, UserMessagePatterns } from '@h2-trust/amqp';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly service: UserService) {}

  @MessagePattern(UserMessagePatterns.READ_WITH_COMPANY)
  async readUserWithCompany(@Payload() payload: { id: string }): Promise<UserDetailsEntity> {
    return this.service.readUserWithCompany(payload.id);
  }
}
