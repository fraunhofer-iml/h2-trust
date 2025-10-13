/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { buildProcessStepCreateInput } from '../create-inputs';
import { PrismaService } from '../prisma.service';
import { processStepQueryArgs } from '../query-args';
import { assertRecordFound } from './utils';

@Injectable()
export class ProcessStepRepository {
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

  async findProcessSteps(processTypes: string[], active: boolean, companyId: string): Promise<ProcessStepEntity[]> {
    return this.prismaService.processStep
      .findMany({
        where: {
          processTypeName: { in: processTypes },
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
}
