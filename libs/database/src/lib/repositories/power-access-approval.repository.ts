/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { PowerAccessApprovalEntity } from '@h2-trust/amqp';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { PrismaService } from '../prisma.service';
import { powerAccessApprovalDeepQueryArgs } from '../query-args/power-access-approval.query-args';

@Injectable()
export class PowerAccessApprovalRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(producerId: string, _status: PowerAccessApprovalStatus): Promise<PowerAccessApprovalEntity[]> {
    return this.prismaService.powerAccessApproval
      .findMany({
        where: {
          OR: [{ powerProducerId: producerId }, { hydrogenProducerId: producerId }],
          status: _status,
        },
        ...powerAccessApprovalDeepQueryArgs,
      })
      .then((result) => result.map(PowerAccessApprovalEntity.fromDeepDatabase));
  }
}
