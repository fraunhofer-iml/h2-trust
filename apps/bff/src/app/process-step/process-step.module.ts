import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [ProcessStepController],
  providers: [ProcessStepService],
})
export class ProcessStepModule {}
