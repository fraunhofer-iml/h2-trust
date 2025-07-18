import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { UserService } from '../user/user.service';
import { BottlingController } from './bottling.controller';
import { BottlingService } from './bottling.service';

@Module({
  imports: [new Broker().getBatchSvcBroker(), new Broker().getGeneralSvcBroker(), new Broker().getProcessSvcBroker()],
  controllers: [BottlingController],
  providers: [BottlingService, UserService],
})
export class BottlingModule {}
