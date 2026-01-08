/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import { buildProcessStepCreateInput } from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { processStepQueryArgs } from '../query-args';
import { assertRecordFound } from './utils';

@Injectable()
export class ProcessStepRepository {
  private readonly logger = new Logger(ProcessStepRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async findProcessStep(id: string): Promise<ProcessStepEntity> {
    return this.prismaService.processStep
      .findUnique({
        where: {
          id: id,
        },
        ...processStepQueryArgs,
      })
      .then((record) => assertRecordFound(record, id, 'process-step'))
      .then(ProcessStepEntity.fromDatabase);
  }

  async findProcessStepsByPredecessorTypesAndCompany(
    predecessorProcessTypes: string[],
    companyId: string,
  ): Promise<ProcessStepEntity[]> {
    const predecessorsFilter =
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

    return this.prismaService.processStep
      .findMany({
        where: {
          batch: {
            ...predecessorsFilter,
          },
          executedBy: {
            ownerId: companyId,
          },
        },
        orderBy: {
          endedAt: 'desc',
        },
        ...processStepQueryArgs,
      })
      .then((processSteps) => processSteps.map(ProcessStepEntity.fromDatabase));
  }

  async findProcessStepsByTypesAndActiveAndCompany(
    processTypes: string[],
    active: boolean,
    companyId: string,
  ): Promise<ProcessStepEntity[]> {
    return this.prismaService.processStep
      .findMany({
        where: {
          type: { in: processTypes },
          batch: {
            active: active,
          },
          executedBy: {
            ownerId: companyId,
          },
        },
        orderBy: {
          endedAt: 'desc',
        },
        ...processStepQueryArgs,
      })
      .then((processSteps) => processSteps.map(ProcessStepEntity.fromDatabase));
  }

  async findAllProcessStepsFromStorageUnit(storageUnitId: string): Promise<ProcessStepEntity[]> {
    return this.prismaService.processStep
      .findMany({
        where: {
          batch: {
            hydrogenStorageUnitId: storageUnitId,
            active: true,
          },
        },
        orderBy: {
          endedAt: 'asc',
        },
        ...processStepQueryArgs,
      })
      .then((batches) => batches.map(ProcessStepEntity.fromDatabase));
  }

  async insertProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    return this.prismaService.processStep
      .create({
        data: buildProcessStepCreateInput(processStep),
        ...processStepQueryArgs,
      })
      .then(ProcessStepEntity.fromDatabase);
  }

  async insertManyProcessSteps(processSteps: ProcessStepEntity[]): Promise<ProcessStepEntity[]> {
    // Separate insertion of process steps for efficiency:
    // those without predecessors can use bulk insert
    // those with predecessors need individual inserts
    const processStepsWithoutPredecessors: ProcessStepEntity[] = processSteps.filter(
      (ps) => !ps.batch?.predecessors?.length,
    );
    const processStepsWithPredecessors: ProcessStepEntity[] = processSteps.filter(
      (ps) => ps.batch?.predecessors?.length,
    );

    return this.prismaService.$transaction(async (tx) => {
      const persistedProcessSteps: ProcessStepEntity[] = [];

      if (processStepsWithoutPredecessors.length > 0) {
        const persistedProcessStepsWithoutPredecessors: ProcessStepEntity[] = await this.persistProcessStepsInBulk(
          tx,
          processStepsWithoutPredecessors,
        );
        persistedProcessSteps.push(...persistedProcessStepsWithoutPredecessors);
      }

      const persistedProcessStepsWithPredecessors: ProcessStepEntity[] = await this.persistProcessStepsIndividually(
        tx,
        processStepsWithPredecessors,
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
      ...processStepQueryArgs,
    });

    return fetchedProcessSteps.map(ProcessStepEntity.fromDatabase);
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
        ...processStepQueryArgs,
      });
      persistedProcessSteps.push(ProcessStepEntity.fromDatabase(persistedProcessStep));
    }

    return persistedProcessSteps;
  }
}
