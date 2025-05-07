import { Injectable } from '@nestjs/common';
import { BatchEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { batchResultFields } from '../queries';

@Injectable()
export class BatchRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllHydrogenBatchesFromStorageUnit(storageUnitId: string): Promise<BatchEntity[]> {
    return this.prismaService.batch
      .findMany({
        where: {
          hydrogenStorageUnitId: storageUnitId,
          active: true,
        },
        orderBy: {
          processStep: {
            endedAt: 'asc',
          },
        },
        include: {
          ...batchResultFields.include,
          processStep: true,
        },
      })
      .then((batches) => batches.map(BatchEntity.fromDatabase));
  }

  async setBatchesInactive(batchIds: string[]): Promise<{ count: number }> {
    return this.prismaService.batch.updateMany({
      where: {
        id: {
          in: batchIds,
        },
      },
      data: {
        active: false,
      },
    });
  }
}
