import { Module } from '@nestjs/common';
import { PowerAccessApprovalController } from './power-access-approval.controller';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Module({
  imports: [],
  controllers: [PowerAccessApprovalController],
  providers: [PowerAccessApprovalService],
})
export class PowerAccessApprovalModule {}
