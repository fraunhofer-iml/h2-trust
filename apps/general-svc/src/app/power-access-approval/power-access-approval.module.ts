import { Module } from '@nestjs/common';
import { DatabaseModule } from '@h2-trust/database';
import { PowerAccessApprovalController } from './power-access-approval.controller';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PowerAccessApprovalController],
  providers: [PowerAccessApprovalService],
})
export class PowerAccessApprovalModule {}
