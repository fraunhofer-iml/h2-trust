import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { UnitController } from './unit.controller';
import { UnitService } from './unit.service';

@Module({
  imports: [new Broker().getGeneralSvcBroker()],
  controllers: [UnitController],
  providers: [UnitService],
})
export class UnitModule {}
