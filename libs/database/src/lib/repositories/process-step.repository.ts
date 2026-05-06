/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProcessStepEntity } from '@h2-trust/contracts/entities';
import { BatchType } from '@h2-trust/domain';
import { buildProcessStepCreateInput } from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { processStepDeepQueryArgs } from '../query-args';
import { assertRecordFound } from './repository-assertions';

@Injectable()
export class ProcessStepRepository {
  private readonly logger = new Logger(ProcessStepRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findPredecessorProcessSteps(startBatchId: string): Promise<string[]> {
    const predecessors = await this.prismaService.$queryRaw<{ processStepId: string | null }[]>`
      WITH RECURSIVE AllPredecessors AS (
        SELECT "B" AS predecessor_id
        FROM "_BatchRelation"
        WHERE "A" = ${startBatchId}

        UNION ALL

        SELECT br."B"
        FROM "_BatchRelation" br
        INNER JOIN AllPredecessors ap ON br."A" = ap.predecessor_id
      )
      SELECT DISTINCT ps."id" AS "processStepId"
      FROM AllPredecessors ap
      JOIN "Batch" b ON b."id" = ap.predecessor_id
      LEFT JOIN "ProcessStep" ps ON ps."batchId" = b."id"
    `;
    return predecessors.map((predecessor) => predecessor.processStepId);
  }

  async findProcessStep(id: string): Promise<ProcessStepEntity> {
    const processStep = await this.prismaService.processStep.findUnique({
      where: {
        id: id,
      },
      ...processStepDeepQueryArgs,
    });
    assertRecordFound(processStep, id, 'process-step');
    return ProcessStepEntity.fromDeepDatabase(processStep);
  }

  async findProcessSteps(ids: string[]): Promise<ProcessStepEntity[]> {
    const processSteps = await this.prismaService.processStep.findMany({
      where: {
        id: { in: ids },
      },
      ...processStepDeepQueryArgs,
    });
    return processSteps.map(ProcessStepEntity.fromDeepDatabase);
  }

  async findProcessStepsByPredecessorTypesAndOwner(
    predecessorProcessTypes: string[],
    ownerId: string,
    hydrogenProductionUnitName?: string,
    period?: Date,
  ): Promise<ProcessStepEntity[]> {
    const predecessorsFilter: Prisma.BatchWhereInput =
      Array.isArray(predecessorProcessTypes) && predecessorProcessTypes.length > 0
        ? {
            predecessors: {
              some: {
                processStep: {
                  type: { in: predecessorProcessTypes },
                },
              },
            },
          }
        : {};

    const batchOwnerFilter: Prisma.BatchWhereInput = {
      ownerId: ownerId,
    };

    const batchFilter: Prisma.BatchWhereInput = {
      AND: [predecessorsFilter, batchOwnerFilter],
    };

    const hydrogenUnitWhereInput: Prisma.UnitWhereInput = hydrogenProductionUnitName
      ? {
          name: {
            contains: hydrogenProductionUnitName,
            mode: 'insensitive',
          },
        }
      : {};

    const periodWhereInput: Prisma.DateTimeFilter = period
      ? {
          gte: new Date(period.getFullYear(), period.getMonth(), 1),
          lt: new Date(period.getFullYear(), period.getMonth() + 1, 1),
        }
      : {};

    const processSteps = await this.prismaService.processStep.findMany({
      where: {
        batch: batchFilter,
        startedAt: periodWhereInput,
        executedBy: {
          ...hydrogenUnitWhereInput,
        },
      },
      orderBy: {
        endedAt: 'desc',
      },
      ...processStepDeepQueryArgs,
    });
    return processSteps.map(ProcessStepEntity.fromDeepDatabase);
  }

  async findProcessStepsByTypesAndActiveAndOwner(
    processTypes: string[],
    active: boolean,
    ownerId: string,
  ): Promise<ProcessStepEntity[]> {
    const processSteps = await this.prismaService.processStep.findMany({
      where: {
        type: { in: processTypes },
        batch: {
          active: active,
        },
        executedBy: {
          ownerId: ownerId,
        },
      },
      orderBy: {
        endedAt: 'desc',
      },
      ...processStepDeepQueryArgs,
    });
    return processSteps.map(ProcessStepEntity.fromDeepDatabase);
  }

  async findAllProcessStepsFromStorageUnit(storageUnitId: string): Promise<ProcessStepEntity[]> {
    const processSteps = await this.prismaService.processStep.findMany({
      where: {
        batch: {
          hydrogenStorageUnitId: storageUnitId,
          active: true,
        },
      },
      orderBy: {
        endedAt: 'asc',
      },
      ...processStepDeepQueryArgs,
    });
    return processSteps.map(ProcessStepEntity.fromDeepDatabase);
  }

  async insertProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    const createdProcessStep = await this.prismaService.processStep.create({
      data: buildProcessStepCreateInput(processStep),
      ...processStepDeepQueryArgs,
    });
    return ProcessStepEntity.fromDeepDatabase(createdProcessStep);
  }

  async insertManyProcessSteps(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    // Separate insertion of process steps for efficiency:
    // those without predecessors can use bulk insert
    // those with predecessors need individual inserts
    // since water process types are the only ones that do not have batch quality, they are the only process steps that can be stored in bulk
    const waterConsumptionProcessSteps: ProcessStepEntity[] = processSteps.filter(
      (ps) => ps.batch?.type == BatchType.WATER,
    );
    const powerOrHydrogenProcessSteps: ProcessStepEntity[] = processSteps.filter(
      (ps) => ps.batch?.type != BatchType.WATER,
    );

    return this.prismaService.$transaction(async (tx) => {
      const persistedProcessSteps: ProcessStepEntity[] = [];

      if (waterConsumptionProcessSteps.length > 0) {
        const persistedProcessStepsWithoutPredecessors: ProcessStepEntity[] = await this.persistProcessStepsInBulk(
          tx,
          waterConsumptionProcessSteps,
        );
        persistedProcessSteps.push(...persistedProcessStepsWithoutPredecessors);
      }

      const persistedProcessStepsWithPredecessors: ProcessStepEntity[] = await this.persistProcessStepsIndividually(
        tx,
        powerOrHydrogenProcessSteps,
      );
      persistedProcessSteps.push(...persistedProcessStepsWithPredecessors);

      return persistedProcessSteps;
    });
  }

  private async persistProcessStepsInBulk(
    tx: Prisma.TransactionClient,
    processSteps: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    const processStepTypes: string = [...new Set(processSteps.map((ps) => ps.type))].join(', ');
    this.logger.debug(`Inserting ${processSteps.length} process steps with types [${processStepTypes}] in bulk.`);

    const batchInputs: Prisma.BatchCreateManyInput[] = processSteps.map((ps) => {
      if (!ps.batch?.amount || !ps.batch?.type || !ps.batch?.owner?.id) {
        throw new Error(`Invalid batch data for process step: ${JSON.stringify(ps)}`);
      }

      return {
        active: ps.batch.active ?? true,
        amount: ps.batch.amount,
        type: BatchType[ps.batch.type as keyof typeof BatchType],
        ownerId: ps.batch.owner.id,
        hydrogenStorageUnitId: ps.batch.hydrogenStorageUnit?.id ?? null,
      };
    });

    const persistedBatches = await tx.batch.createManyAndReturn({ data: batchInputs });

    const processStepInputs: Prisma.ProcessStepCreateManyInput[] = processSteps.map((ps, index) => {
      if (!ps.startedAt || !ps.endedAt || !ps.type || !ps.recordedBy?.id || !ps.executedBy?.id) {
        throw new Error(`Invalid process step data: ${JSON.stringify(ps)}`);
      }

      return {
        startedAt: ps.startedAt,
        endedAt: ps.endedAt,
        type: ps.type,
        batchId: persistedBatches[index].id,
        userId: ps.recordedBy.id,
        unitId: ps.executedBy.id,
      };
    });

    const persistedProcessSteps = await tx.processStep.createManyAndReturn({ data: processStepInputs });

    const fetchedProcessSteps = await tx.processStep.findMany({
      where: { id: { in: persistedProcessSteps.map((ps) => ps.id) } },
      ...processStepDeepQueryArgs,
    });

    return fetchedProcessSteps.map(ProcessStepEntity.fromDeepDatabase);
  }

  private async persistProcessStepsIndividually(
    tx: Prisma.TransactionClient,
    processSteps: ProcessStepEntity[],
  ): Promise<ProcessStepEntity[]> {
    const persistedProcessSteps: ProcessStepEntity[] = [];

    for (const processStep of processSteps) {
      this.logger.debug(`Inserting 1 process step with type [${processStep.type}] individually.`);

      const persistedProcessStep = await tx.processStep.create({
        data: buildProcessStepCreateInput(processStep),
        ...processStepDeepQueryArgs,
      });
      persistedProcessSteps.push(ProcessStepEntity.fromDeepDatabase(persistedProcessStep));
    }

    return persistedProcessSteps;
  }
}
