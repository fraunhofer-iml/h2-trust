import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [new Broker().getGeneralSvcBroker()],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
