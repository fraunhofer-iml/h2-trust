import { Module } from '@nestjs/common';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';
import { Broker } from '@h2-trust/amqp';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [ProcessStepController],
  providers: [ProcessStepService]
})
export class ProcessStepModule {}
