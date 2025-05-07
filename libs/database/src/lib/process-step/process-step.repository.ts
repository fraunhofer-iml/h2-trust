import { HttpStatus, Injectable } from '@nestjs/common';
import { BatchType } from '@prisma/client';
import { BrokerException, ProcessStepEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { processStepResultFields } from '../queries';
import { retrieveRecordOrThrowException } from '../utils/utils';

@Injectable()
export class ProcessStepRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findProcessStep(id: string): Promise<ProcessStepEntity> {
    return this.prismaService.processStep
      .findUnique({
        where: {
          id: id,
        },
        ...processStepResultFields,
      })
      .then((record) => retrieveRecordOrThrowException(record, id, 'process-step'))
      .then(ProcessStepEntity.fromDatabase);
  }

  async findProcessSteps(processTypeName: string, active: boolean, companyId: string): Promise<ProcessStepEntity[]> {
    return this.prismaService.processStep
      .findMany({
        where: {
          processTypeName: processTypeName,
          batch: {
            active: active,
          },
          executedBy: {
            companyId: companyId,
          },
        },
        orderBy: {
          endedAt: 'desc',
        },
        ...processStepResultFields,
      })
      .then((processSteps) => processSteps.map(ProcessStepEntity.fromDatabase));
  }

  async insertProcessStep(entity: ProcessStepEntity, predecessorBatchIds: string[]): Promise<ProcessStepEntity> {
    if (!entity.batch) {
      throw new BrokerException('ProcessStepEntity.batch was undefined', HttpStatus.BAD_REQUEST);
    }
    return this.prismaService.processStep
      .create({
        data: {
          startedAt: entity.startedAt,
          endedAt: entity.endedAt,
          processType: {
            connect: {
              name: entity.processTypeName,
            },
          },
          batch: {
            create: {
              active: true,
              amount: entity.batch.amount,
              quality: entity.batch.quality,
              type: BatchType[entity.batch.type as keyof typeof BatchType],

              owner: {
                connect: {
                  id: entity.batch.owner?.id,
                },
              },
              predecessors: {
                connect: predecessorBatchIds.map((id) => {
                  return { id: id };
                }),
              },
              ...(entity.batch.hydrogenStorageUnitId && {
                hydrogenStorageUnit: {
                  connect: {
                    id: entity.batch.hydrogenStorageUnitId,
                  },
                },
              }),
            },
          },
          recordedBy: {
            connect: {
              id: entity.userId,
            },
          },
          executedBy: {
            connect: {
              id: entity.unitId,
            },
          },
        },
        ...processStepResultFields,
      })
      .then(ProcessStepEntity.fromDatabase);
  }
}
