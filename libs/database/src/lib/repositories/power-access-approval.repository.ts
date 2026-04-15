/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { PowerPurchaseAgreementEntity } from '@h2-trust/amqp';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { PrismaService } from '../prisma.service';
import { powerAccessApprovalDeepQueryArgs } from '../query-args/power-access-approval/power-access-approval.deep.query-args';

@Injectable()
export class PowerPurchaseAgreementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(producerId: string, _status: PowerPurchaseAgreementStatus): Promise<PowerPurchaseAgreementEntity[]> {
    return this.prismaService.powerAccessApproval
      .findMany({
        where: {
          OR: [{ powerProducerId: producerId }, { hydrogenProducerId: producerId }],
          status: _status,
        },
        ...powerAccessApprovalDeepQueryArgs,
      })
      .then((result) => result.map(PowerPurchaseAgreementEntity.fromDeepDatabase));
  }
}
