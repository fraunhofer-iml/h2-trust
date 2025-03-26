import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AmqpClientEnum, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { ProcessingOverviewDto } from '@h2-trust/api';

@Injectable()
export class ProcessingService {
  constructor(@Inject(AmqpClientEnum.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) {}

  readProcessing(processName: string, active: boolean, companyId: string): Promise<ProcessingOverviewDto[]> {
    return firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_ALL, { processName, active, companyId }),
    );
  }
}
