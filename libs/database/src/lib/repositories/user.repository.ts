/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { UserEntity } from '@h2-trust/contracts/entities';
import { PrismaService } from '../prisma.service';
import { userDeepQueryArgs } from '../query-args';
import { wrapPrismaError } from './prisma-error.wrapper';
import { assertRecordFound } from './repository-assertions';

@Injectable()
export class UserRepository {
  private readonly entityLabel = 'User';

  constructor(private readonly prismaService: PrismaService) {}

  async findUser(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user
      .findUnique({ where: { id }, ...userDeepQueryArgs })
      .catch(wrapPrismaError);

    this.assertFound(user, id);
    return UserEntity.fromDeepDatabase(user);
  }

  private assertFound<T>(rec: T | null | undefined, id: string): asserts rec is T {
    assertRecordFound(rec, id, this.entityLabel);
  }
}
