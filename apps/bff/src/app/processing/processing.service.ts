import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessingOverviewDto } from '@h2-trust/api';

@Injectable()
export class ProcessingService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) {}

  async readProcessing(processTypeName: string, active: boolean, companyId: string): Promise<ProcessingOverviewDto[]> {
    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_ALL, { processTypeName, active, companyId }),
    ).then((entities) => entities.map(ProcessingOverviewDto.fromEntity));
  }
}
