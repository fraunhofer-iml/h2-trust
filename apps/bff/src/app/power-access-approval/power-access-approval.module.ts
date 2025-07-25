import { Module } from '@nestjs/common';
import { PowerAccessApprovalController } from './power-access-approval.controller';
import { PowerAccessApprovalService } from './power-access-approval.service';
import { Broker } from '@h2-trust/amqp';

@Module({
  imports: [new Broker().getGeneralSvcBroker()],
  controllers: [PowerAccessApprovalController],
  providers: [PowerAccessApprovalService],
})
export class PowerAccessApprovalModule {}
