import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { ConfigurationModule } from '@h2-trust/configuration';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';

@Module({
  imports: [ConfigurationModule, new Broker().getBatchSvcBroker()],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
