import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AuthenticatedKCUser, PowerAccessApprovalDto, PowerAccessApprovalStatus } from '@h2-trust/api';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller('power-access-approvals')
export class PowerAccessApprovalController {
  constructor(private readonly powerAccessApprovalService: PowerAccessApprovalService) {}

  @Get()
  @ApiOperation({ description: 'Get all Companies with Power Access Approvals' })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiQuery({
    name: 'status',
    enum: PowerAccessApprovalStatus,
    required: false,
    examples: {
      allTypes: { value: null, description: 'Get approvals of all status' },
      APPROVED: {
        value: PowerAccessApprovalStatus.APPROVED,
        description: 'Get all approved PAAs',
      },
      PENDING: {
        value: PowerAccessApprovalStatus.PENDING,
        description: 'Get all pending PAAs',
      },
      REJECTED: {
        value: PowerAccessApprovalStatus.REJECTED,
        description: 'Get all rejected PAAs',
      },
    },
  })
  getCompaniesWithApprovals(
    @AuthenticatedUser() user: AuthenticatedKCUser,
    @Query('status') status: PowerAccessApprovalStatus,
  ): PowerAccessApprovalDto[] {
    return this.powerAccessApprovalService.findAll(user.sub, status);
  }
}
