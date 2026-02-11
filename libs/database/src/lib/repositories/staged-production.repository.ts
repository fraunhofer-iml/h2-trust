/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DistributedProductionEntity, StagedProductionEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { stagedProductionDeepQueryArgs } from '../query-args';
import { StagedProductionDeepDbType } from '../types';

@Injectable()
export class StagedProductionRepository {
  static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

  constructor(private readonly prismaService: PrismaService) { }

  async stageDistributedProductions(
    distributedProductions: DistributedProductionEntity[],
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx ?? this.prismaService;
    const importId = randomUUID();

    await client.stagedProduction.createMany({
      data: distributedProductions.map(
        ({ startedAt, hydrogenAmount, hydrogenProductionUnitId, powerAmount, powerProductionUnitId }) => ({
          startedAt,
          hydrogenAmount,
          hydrogenProductionUnitId,
          importId,
          powerAmount,
          powerProductionUnitId,
        }),
      ),
    });

    return importId;
  }

  async getStagedProductionsByImportId(id: string): Promise<StagedProductionEntity[]> {
    const stagedProductions: StagedProductionDeepDbType[] = await this.prismaService.stagedProduction.findMany({
      where: { importId: id },
      include: {
        ...stagedProductionDeepQueryArgs.include,
      },
    });

    if (!stagedProductions || stagedProductions.length === 0) {
      throw new Error(`Could not find staged production for id ${id}`);
    }

    return stagedProductions.map(StagedProductionEntity.fromDeepDatabase);
  }

  async deleteExpiredStagedProductions() {
    const expirationThreshold: Date = new Date(Date.now() - StagedProductionRepository.DAY_IN_MS);

    return await this.prismaService.stagedProduction.deleteMany({
      where: {
        createdAt: {
          lt: expirationThreshold,
        },
      },
    });
  }
}
