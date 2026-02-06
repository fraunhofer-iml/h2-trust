/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { UserEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { userDeepQueryArgs } from '../query-args';
import { assertRecordFound } from './utils';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUser(id: string): Promise<UserEntity> {
    return this.prismaService.user
      .findUnique({
        where: {
          id: id,
        },
        ...userDeepQueryArgs,
      })
      .then((result) => assertRecordFound(result, id, 'User'))
      .then(UserEntity.fromDeepDatabase);
  }
}
