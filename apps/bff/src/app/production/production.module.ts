import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { UserService } from '../user/user.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  controllers: [ProductionController],
  providers: [ProductionService, UserService],
})
export class ProductionModule { }
