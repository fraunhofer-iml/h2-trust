import { firstValueFrom } from 'rxjs';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { BrokerQueues, HydrogenComponentEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { HydrogenComponentAssembler } from './hydrogen-component-assembler';

@Injectable()
export class BottlingService {
  constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) {}

  async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenComponentEntity[]> {
    const bottlingProcessStep: ProcessStepEntity = await firstValueFrom(
      this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId: bottlingProcessStepId }),
    );

    return HydrogenComponentAssembler.assembleFromBottlingProcessStep(bottlingProcessStep);
  }
}
