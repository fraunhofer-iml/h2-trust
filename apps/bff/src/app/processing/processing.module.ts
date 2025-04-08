import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProcessingController } from './processing.controller';
import { ProcessingService } from './processing.service';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [ProcessingController],
  providers: [ProcessingService],
})
export class ProcessingModule {}
