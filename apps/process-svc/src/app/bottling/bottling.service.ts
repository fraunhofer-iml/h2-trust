import { BrokerQueues, HydrogenCompositionEntity, ProcessStepEntity, ProcessStepMessagePatterns } from '@h2-trust/amqp';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HydrogenCompositionCalculator } from './hydrogen-composition-calculator';

@Injectable()
export class BottlingService {
    constructor(@Inject(BrokerQueues.QUEUE_BATCH_SVC) private readonly batchService: ClientProxy) { }

    async calculateHydrogenComposition(bottlingProcessStepId: string): Promise<HydrogenCompositionEntity[]> {
        const bottlingProcessStep: ProcessStepEntity = await firstValueFrom(
            this.batchService.send(ProcessStepMessagePatterns.READ_UNIQUE, { processStepId: bottlingProcessStepId }),
        );

        return HydrogenCompositionCalculator.calculateFromBottlingProcessStep(bottlingProcessStep);
    }
}
