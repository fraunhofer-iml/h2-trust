import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchType } from '@prisma/client';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/api';
import { PrismaService } from '../prisma.service';
import { processStepResultFields } from '../result-fields';
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
        ...processStepResultFields,
      })
      .then((record) => assertRecordFound(record, id, 'process-step'))
      .then(ProcessStepEntity.fromDatabase);
  }

  async findProcessSteps(processType: string, active: boolean, companyId: string): Promise<ProcessStepEntity[]> {
    return this.prismaService.processStep
      .findMany({
        where: {
          processTypeName: processType,
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
        ...processStepResultFields,
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
        ...processStepResultFields,
      })
      .then((batches) => batches.map(ProcessStepEntity.fromDatabase));
  }

  async insertProcessStep(processStep: ProcessStepEntity): Promise<ProcessStepEntity> {
    if (processStep.processType === ProcessType.POWER_PRODUCTION && processStep.batch?.hydrogenStorageUnit?.id) {
      throw new BrokerException(`Power production batch with amount [${processStep.batch?.amount}] has a hydrogen storage unit [${processStep.batch.hydrogenStorageUnit.id}]`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (processStep.processType === ProcessType.HYDROGEN_PRODUCTION && !processStep.batch?.hydrogenStorageUnit?.id) {
      throw new BrokerException(`Hydrogen production batch with amount [${processStep.batch?.amount}] has no hydrogen storage unit`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (processStep.processType === ProcessType.BOTTLING && processStep.batch?.hydrogenStorageUnit?.id) {
      throw new BrokerException(`Hydrogen bottling batch with amount [${processStep.batch?.amount}] has a hydrogen storage unit [${processStep.batch.hydrogenStorageUnit.id}]`, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    if (!processStep.batch) {
      throw new BrokerException('ProcessStepEntity.batch was undefined', HttpStatus.BAD_REQUEST);
    }

    if (!processStep.batch.amount) {
      throw new BrokerException('ProcessStepEntity.batch.amount was undefined', HttpStatus.BAD_REQUEST);
    }

    if (!processStep.batch.predecessors) {
      processStep.batch.predecessors = [];
    }

    return this.prismaService.processStep
      .create({
        data: {
          startedAt: processStep.startedAt,
          endedAt: processStep.endedAt,
          processType: {
            connect: {
              name: processStep.processType,
            },
          },
          batch: {
            create: {
              active: processStep.batch.active ?? true,
              amount: processStep.batch.amount,
              quality: processStep.batch.quality ?? '{}',
              type: BatchType[processStep.batch.type as keyof typeof BatchType],

              owner: {
                connect: {
                  id: processStep.batch.owner?.id,
                },
              },
              predecessors: {
                connect: processStep.batch.predecessors.map((batch) => {
                  return { id: batch.id };
                }),
              },
              ...(processStep.batch.hydrogenStorageUnit?.id && {
                hydrogenStorageUnit: {
                  connect: {
                    id: processStep.batch.hydrogenStorageUnit.id,
                  },
                },
              }),
            },
          },
          recordedBy: {
            connect: {
              id: processStep.recordedBy?.id,
            },
          },
          executedBy: {
            connect: {
              id: processStep.executedBy?.id,
            },
          },
        },
        ...processStepResultFields,
      })
      .then(ProcessStepEntity.fromDatabase);
  }
}
