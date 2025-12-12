/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import { buildProcessStepCreateInput } from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { processStepQueryArgs } from '../query-args';
import { assertRecordFound } from './utils';

@Injectable()
export class ProcessStepRepository {
  constructor(private readonly prismaService: PrismaService) { }

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

  async findProcessSteps(
    processTypes: string[],
    predecessorProcessTypes: string[],
    active: boolean,
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
          type: { in: processTypes },
          batch: {
            active: active,
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
    const processStepsWithoutPredecessors = processSteps.filter((ps) => !ps.batch?.predecessors?.length);
    const processStepsWithPredecessors = processSteps.filter((ps) => ps.batch?.predecessors?.length);

    return this.prismaService.$transaction(async (tx) => {
      const allPersistedProcessSteps: ProcessStepEntity[] = [];

      // Bulk insert for process steps without predecessors
      if (processStepsWithoutPredecessors.length > 0) {
        console.log(`Inserting ${processStepsWithoutPredecessors.length} process steps without predecessors in bulk.`);

        // Step 1: Persist batches in bulk
        const persistedBatches = await tx.batch.createManyAndReturn({
          data: processStepsWithoutPredecessors.map((ps) => ({
            active: ps.batch?.active ?? true,
            amount: ps.batch?.amount!,
            type: BatchType[ps.batch?.type as keyof typeof BatchType],
            ownerId: ps.batch?.owner?.id!,
            hydrogenStorageUnitId: ps.batch?.hydrogenStorageUnit?.id ?? null,
          }))
        });

        // Step 2: Persist process steps in bulk
        const persistedProcessSteps = await tx.processStep.createManyAndReturn({
          data: processStepsWithoutPredecessors.map((ps, index) => ({
            startedAt: ps.startedAt!,
            endedAt: ps.endedAt!,
            type: ps.type!,
            batchId: persistedBatches[index].id,
            userId: ps.recordedBy?.id!,
            unitId: ps.executedBy?.id!,
          }))
        });

        // Step 3: Fetch process steps with full relations
        const fetchedProcessSteps = await tx.processStep.findMany({
          where: { id: { in: persistedProcessSteps.map((ps) => ps.id) } },
          ...processStepQueryArgs,
        });
        allPersistedProcessSteps.push(...fetchedProcessSteps.map(ProcessStepEntity.fromDatabase));
      }

      // Individual inserts for process steps with predecessors
      for (const processStep of processStepsWithPredecessors) {
        console.log(`Inserting process step with type ${processStep.type} with predecessors individually.`);
        const persistedProcessStep = await tx.processStep.create({
          data: buildProcessStepCreateInput(processStep),
          ...processStepQueryArgs,
        });
        allPersistedProcessSteps.push(ProcessStepEntity.fromDatabase(persistedProcessStep));
      }

      return allPersistedProcessSteps;
    });
  }
}
