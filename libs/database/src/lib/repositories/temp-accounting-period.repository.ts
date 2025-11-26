/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProductionIntervallEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TempAccountingPeriodRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createProductionIntervalls(data: ProductionIntervallEntity[]) {
    return this.prismaService.productionIntervallSet.create({
      data: {
        productionIntervalls: {
          createMany: { data: data },
        },
      },
    });
  }

  async getIntervallSetById(id: string): Promise<ProductionIntervallEntity[]> {
    const res = await this.prismaService.productionIntervallSet.findUnique({
      where: { id: id },
      include: { productionIntervalls: true },
    });

    if (!res) throw new Error(`Could not find Intervalls for id ${id}`);
    return res.productionIntervalls.map(ProductionIntervallEntity.fromDatabase);
  }

  async deleteOldIntervalls() {
    const expirationThreshold: Date = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await this.prismaService.productionIntervallSet.deleteMany({
      where: {
        createdAt: {
          lt: expirationThreshold,
        },
      },
    });
  }
}
