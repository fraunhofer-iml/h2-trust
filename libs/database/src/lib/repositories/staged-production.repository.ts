/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StagedProductionEntity } from '@h2-trust/contracts/entities';
import { ReadStagedProductionsPayload } from '@h2-trust/contracts/payloads';
import { PrismaService } from '../prisma.service';
import { stagedProductionDeepQueryArgs } from '../query-args';
import { StagedProductionDeepDbType } from '../types';

@Injectable()
export class StagedProductionRepository {
  static readonly DAY_IN_MS = 24 * 60 * 60 * 1000;

  constructor(private readonly prismaService: PrismaService) {}

  async findStagedProduction(id: string): Promise<StagedProductionEntity> {
    return this.prismaService.stagedProduction
      .findFirst({
        where: {
          id: id,
        },
        ...stagedProductionDeepQueryArgs,
      })
      .then((stagedProduction) => StagedProductionEntity.fromDeepDatabase(stagedProduction));
  }

  async findStagedProductions(
    payload: ReadStagedProductionsPayload,
    onlyOwnProductions: boolean,
    unitIds: string[],
  ): Promise<StagedProductionEntity[]> {
    const stagedProductionFilter: Prisma.StagedProductionWhereInput = {
      ...(onlyOwnProductions && { ownerId: payload.ownerId }),
      ...(payload.type !== undefined && { type: payload.type }),
      ...(payload.from !== undefined && { startedAt: payload.from }),
      ...(payload.to !== undefined && { endedAt: payload.to }),
      ...(unitIds !== undefined &&
        unitIds.length > 0 && {
          unitId: { in: unitIds },
        }),
    };
    const stagedProductions: StagedProductionDeepDbType[] = await this.prismaService.stagedProduction.findMany({
      where: stagedProductionFilter,
      ...stagedProductionDeepQueryArgs,
    });
    return stagedProductions.map(StagedProductionEntity.fromDeepDatabase);
  }

  async saveStagedProductions(
    stagedProductions: StagedProductionEntity[],
    csvImportId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx ?? this.prismaService;

    await client.stagedProduction.createMany({
      data: stagedProductions.map(({ startedAt, endedAt, ownerId, amountProduced, unitId, powerConsumed, type }) => ({
        startedAt,
        endedAt,
        ownerId,
        amountProduced,
        unitId,
        csvImportId,
        powerConsumed,
        type,
      })),
    });
  }

  async getStagedProductionsByCsvImportId(csvImportId: string): Promise<StagedProductionEntity[]> {
    const stagedProductions: StagedProductionDeepDbType[] = await this.prismaService.stagedProduction.findMany({
      where: { csvImportId },
      include: {
        ...stagedProductionDeepQueryArgs.include,
      },
    });

    if (!stagedProductions || stagedProductions.length === 0) {
      throw new Error(`Could not find staged production for csv import ${csvImportId}`);
    }

    return stagedProductions.map(StagedProductionEntity.fromDeepDatabase);
  }

  async deleteExpiredStagedProductions() {
    const expirationThreshold: Date = new Date(Date.now() - StagedProductionRepository.DAY_IN_MS);

    return await this.prismaService.stagedProduction.deleteMany({
      where: {
        csvImport: {
          createdAt: { lt: expirationThreshold },
        },
      },
    });
  }
}
