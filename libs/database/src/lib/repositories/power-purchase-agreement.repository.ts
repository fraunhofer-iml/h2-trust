/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PowerPurchaseAgreementEntity } from '@h2-trust/contracts/entities';
import {
  CreatePowerPurchaseAgreementsPayload,
  UpdatePowerPurchaseAgreementPayload,
} from '@h2-trust/contracts/payloads';
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
      .then((result) => {
        console.log('PPA findMany result:', result);
        return result.map(PowerPurchaseAgreementEntity.fromDeepDatabase);
      });
  }

  async create(
    ppa: CreatePowerPurchaseAgreementsPayload,
    hydrogenProducerCompanyId: string,
  ): Promise<PowerPurchaseAgreementEntity> {
    return this.prismaService.powerPurchaseAgreement
      .create({
        data: {
          createdAt: new Date(),
          validTo: ppa.validTo,
          validFrom: ppa.validFrom,
          status: PowerPurchaseAgreementStatus.PENDING,
          suggestedPowerType: {
            connect: {
              name: ppa.powerProductionType,
            },
          },
          hydrogenProducer: {
            connect: {
              id: hydrogenProducerCompanyId,
            },
          },
          creatingUser: { connect: { id: ppa.userId } },
          powerProducer: { connect: { id: ppa.companyId } },
        },
        ...powerPurchaseAgreementDeepQueryArgs,
      })
      .then((result) => PowerPurchaseAgreementEntity.fromDeepDatabase(result));
  }

  async updatePpaStatus(ppa: UpdatePowerPurchaseAgreementPayload): Promise<any> {
    return this.prismaService.powerPurchaseAgreement
      .update({
        where: { id: ppa.ppaId },
        data: {
          status: ppa.decision,
          decision: {
            create: this.buildDecisionUpdateQuery(ppa),
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
    let query: Prisma.PowerPurchaseAgreementWhereInput;

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

  private buildDecisionUpdateQuery(
    payload: UpdatePowerPurchaseAgreementPayload,
  ): Prisma.DecisionCreateWithoutPowerPurchaseAgreementInput {
    const base: Prisma.DecisionCreateWithoutPowerPurchaseAgreementInput = {
      decidedAt: new Date(),
      decidingUser: {
        connect: { id: payload.decidingUserId },
      },
      comment: payload.comment ?? undefined,
    };

    if (payload.decision === PowerPurchaseAgreementStatus.APPROVED) {
      return {
        ...base,
        grantedPowerProductionUnit: {
          connect: { id: payload.powerProductionUnitId },
        },
      };
    }

    return base;
  }
}
