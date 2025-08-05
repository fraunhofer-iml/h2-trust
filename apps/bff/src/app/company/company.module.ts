import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { Broker } from '@h2-trust/amqp';

@Module({
  imports: [new Broker().getGeneralSvcBroker()],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
