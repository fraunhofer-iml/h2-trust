/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PowerPurchaseAgreementEntity, UpdatePowerPurchaseAgreementPayload } from '@h2-trust/amqp';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { PrismaService } from '../prisma.service';
import { powerPurchaseAgreementDeepQueryArgs } from '../query-args/power-purchase-agreement/power-purchase-agreement.deep.query-args';

@Injectable()
export class PowerPurchaseAgreementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    producerId: string,
    status?: PowerPurchaseAgreementStatus,
    role?: PpaRequestRole,
  ): Promise<PowerPurchaseAgreementEntity[]> {
    return this.prismaService.powerPurchaseAgreement
      .findMany({
        where: this.buildRoleQuery(producerId, status, role),
        ...powerPurchaseAgreementDeepQueryArgs,
      })
      .then((result) => result.map(PowerPurchaseAgreementEntity.fromDeepDatabase));
  }

  /*    async insert(ppa: CreatePowerPurchaseAgreementsPayload): Promise<PowerPurchaseAgreementEntity> {
    return; this.prismaService.powerPurchaseAgreement.create();
  } */
  async update(ppa: UpdatePowerPurchaseAgreementPayload): Promise<any> {
    return this.prismaService.powerPurchaseAgreement
      .update({
        where: { id: ppa.ppaId },
        data: {
          decision: {
            update: {
              data: { status: ppa.decision },
            },
          },
        },
        ...powerPurchaseAgreementDeepQueryArgs,
      })
      .then((result) => PowerPurchaseAgreementEntity.fromDeepDatabase(result));
  }

  private buildRoleQuery(
    producerId: string,
    status?: PowerPurchaseAgreementStatus,
    role?: PpaRequestRole,
  ): Prisma.PowerPurchaseAgreementWhereInput {
    let query: Prisma.PowerPurchaseAgreementWhereInput = {};

    switch (role) {
      case PpaRequestRole.RECEIVER:
        query = { powerProducerId: producerId };
        break;
      case PpaRequestRole.SENDER:
        query = { hydrogenProducerId: producerId };
        break;
      default:
        query = {
          OR: [{ powerProducerId: producerId }, { hydrogenProducerId: producerId }],
        };
    }

    if (status) {
      query.status = status;
    }
    return query;
  }
}
