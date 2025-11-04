/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { PowerProductionTypeEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PowerProductionTypeRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findPowerProductionTypes(): Promise<PowerProductionTypeEntity[]> {
    return this.prismaService.powerProductionType
      .findMany()
      .then((result) => result.map(PowerProductionTypeEntity.fromDatabase));
  }
}
