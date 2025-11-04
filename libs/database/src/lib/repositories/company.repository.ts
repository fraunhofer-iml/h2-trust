/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { CompanyEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { companyQueryArgs } from '../query-args';

@Injectable()
export class CompanyRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<CompanyEntity[]> {
    return this.prismaService.company
      .findMany({ ...companyQueryArgs })
      .then((result) => result.map(CompanyEntity.fromDatabase));
  }
}
