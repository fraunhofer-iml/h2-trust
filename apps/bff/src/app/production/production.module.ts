import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports: [new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
