import { Module } from '@nestjs/common';
import { ProcessingController } from './processing.controller';
import { ProcessingService } from './processing.service';
import { Broker } from '@h2-trust/amqp';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [ProcessingController],
  providers: [ProcessingService]
})
export class ProcessingModule {}
