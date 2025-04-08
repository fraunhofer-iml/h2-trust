import { Injectable } from '@nestjs/common';
import { ProcessStepEntity } from '@h2-trust/amqp';
import { PrismaService } from '../prisma.service';
import { processStepResultFields } from '../queries';

@Injectable()
export class ProcessStepRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async readProcessSteps(processTypeName: string, active: boolean, companyId: string): Promise<ProcessStepEntity[]> {
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
          timestamp: 'desc',
        },
        ...processStepResultFields,
      })
      .then((processSteps) => processSteps.map(ProcessStepEntity.fromDatabase));
  }
}
