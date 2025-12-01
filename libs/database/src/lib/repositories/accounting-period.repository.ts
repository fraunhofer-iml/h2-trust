/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import cuid from 'cuid';
import { Injectable } from '@nestjs/common';
import { AccountingPeriodEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccountingPeriodRepository {
  static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;
  constructor(private readonly prismaService: PrismaService) {}

  async stageProduction(data: AccountingPeriodEntity[]) {
    const importId = cuid();

    await this.prismaService.stagedProduction.createMany({
      data: data.map(({ startedAt, hydrogenAmount, hydrogenProductionUnitId, powerAmount, powerProductionUnitId }) => ({
        startedAt,
        hydrogenAmount,
        hydrogenProductionUnitId,
        importId,
        powerAmount,
        powerProductionUnitId,
      })),
    });

    return importId;
  }

  async getStagedProductionByImportId(id: string): Promise<AccountingPeriodEntity[]> {
    const res = await this.prismaService.stagedProduction.findMany({
      where: { importId: id },
    });

    if (!res || res.length === 0) {
      throw new Error(`Could not find staged production for id ${id}`);
    }

    return res.map(AccountingPeriodEntity.fromDatabase);
  }

  async deleteExpiredAccountingPeriods() {
    const expirationThreshold: Date = new Date(Date.now() - AccountingPeriodRepository.DAY_IN_MS);

    return await this.prismaService.stagedProduction.deleteMany({
      where: {
        createdAt: {
          lt: expirationThreshold,
        },
      },
    });
  }
}
