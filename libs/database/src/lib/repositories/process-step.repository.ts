/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProcessStepEntity, RootProductionEntity } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import { buildProcessStepCreateInput } from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { processStepDeepQueryArgs } from '../query-args';
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
        ...processStepDeepQueryArgs,
      })
      .then((record) => assertRecordFound(record, id, 'process-step'))
      .then(ProcessStepEntity.fromDeepDatabase);
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

    return this.prismaService.processStep
      .findMany({
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
      })
      .then((processSteps) => processSteps.map(ProcessStepEntity.fromDeepDatabase));
  }

  async findProcessStepsByTypesAndActiveAndOwner(
    processTypes: string[],
    active: boolean,
    ownerId: string,
  ): Promise<ProcessStepEntity[]> {
    return this.prismaService.processStep
      .findMany({
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
      })
      .then((processSteps) => processSteps.map(ProcessStepEntity.fromDeepDatabase));
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
        ...processStepDeepQueryArgs,
      })
      .then((batches) => batches.map(ProcessStepEntity.fromDeepDatabase));
  }

  async insertProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    return this.prismaService.processStep
      .create({
        data: buildProcessStepCreateInput(processStep),
        ...processStepDeepQueryArgs,
      })
      .then(ProcessStepEntity.fromDeepDatabase);
  }

  async insertRootProductionProcessSteps(rootProductions: RootProductionEntity[]): Promise<ProcessStepEntity[]> {
    return (
      await Promise.all(rootProductions.map((rootProduction) => this.insertRootProductionProcessStep(rootProduction)))
    ).flatMap((x) => x);
  }

  //TODO-LG: improve performance of this function so, that the 3 process steps are created in bulk.
  private async insertRootProductionProcessStep(rootProduction: RootProductionEntity): Promise<ProcessStepEntity[]> {
    const persistedPowerPs: ProcessStepEntity = await this.insertProcessStep(rootProduction.powerProduction);
    const persistedWaterPs: ProcessStepEntity = await this.insertProcessStep(rootProduction.waterConsumption);

    const newHydrogenProduction: ProcessStepEntity = rootProduction.hydrogenProduction;
    newHydrogenProduction.batch.predecessors = [persistedPowerPs.batch, persistedWaterPs.batch];

    const persistedHydrogenProduction: ProcessStepEntity = await this.insertProcessStep(newHydrogenProduction);
    return [persistedPowerPs, persistedWaterPs, persistedHydrogenProduction];
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
