import { Injectable } from '@nestjs/common';
import { ProcessingOverviewDto, processStepResultFields } from '@h2-trust/api';
import { PrismaService } from '@h2-trust/database';
import { mapAllProcessStepsToProcessingOverviewRows } from './process-step.mapper';


@Injectable()
export class ProcessStepService {
  constructor(private readonly prismaService: PrismaService) {}

  async readProcessSteps(processName: string, active: boolean, companyId: string): Promise<ProcessingOverviewDto[]> {
    return this.prismaService.processStep
      .findMany({
        where: {
          processName: processName,
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
      .then(mapAllProcessStepsToProcessingOverviewRows);
  }
}
