import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

@Module({
  imports: [new Broker().getBatchSvcBroker()],
  controllers: [BottlingController],
  providers: [BottlingService],
  exports: [],
})
export class BottlingModule {}
