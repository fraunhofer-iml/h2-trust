import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { UserService } from '../user/user.service';
import { ProcessStepController } from './process-step.controller';
import { ProcessStepService } from './process-step.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker()],
  controllers: [ProcessStepController],
  providers: [ProcessStepService, UserService],
})
export class ProcessStepModule {}
