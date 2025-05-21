import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BatchRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
