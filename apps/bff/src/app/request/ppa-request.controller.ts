import { Controller, Get, Param } from '@nestjs/common';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';

@Controller('ppa-request')
export class PpaRequestController {
  @Get()
  getPPARequest(@Param('role') role: PpaRequestRole, @Param('status') status: PowerAccessApprovalStatus) {
    console.log(role);
    console.log(status);
  }
}
