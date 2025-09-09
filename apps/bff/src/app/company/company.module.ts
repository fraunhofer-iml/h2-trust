import { Module } from '@nestjs/common';
import { Broker } from '@h2-trust/amqp';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [new Broker().getGeneralSvcBroker()],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
