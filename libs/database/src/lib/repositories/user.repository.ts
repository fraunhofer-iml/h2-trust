/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { UserDetailsEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { userWithCompanyResultFields } from '../result-fields';
import { assertRecordFound } from './utils';

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserWithCompany(id: string): Promise<UserDetailsEntity> {
    return this.prismaService.user
      .findUnique({
        where: {
          id: id,
        },
        ...userWithCompanyResultFields,
      })
      .then((result) => assertRecordFound(result, id, 'User'));
  }
}
