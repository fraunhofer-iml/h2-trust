import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BatchEntity, BrokerQueues, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';

@Injectable()
export class ProcessStepService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) {}

  async fetchProcessStepsOfBatches(batches: BatchEntity[]): Promise<ProcessStepEntity[]> {
    const promises = batches.map(({ processStepId }) => this.fetchProcessStep(processStepId));
    return Promise.all(promises);
  }

  async fetchProcessStep(processStepId: string): Promise<ProcessStepEntity> {
    return firstValueFrom(this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId }));
  }
}
