/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PowerAccessApprovalDto, PpaRequestDto, type AuthenticatedKCUser } from '@h2-trust/api';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { PowerAccessApprovalService } from './power-access-approval.service';

@Controller('power-access-approvals')
export class PowerAccessApprovalController {
  constructor(private readonly powerAccessApprovalService: PowerAccessApprovalService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all companies with their power access approval. Optionally filter by approval status.',
  })
  @ApiOkResponse({
    description: 'Returns a list of all companies with their power access approval matching the filter criteria.',
    type: [PowerAccessApprovalDto],
  })
  @ApiQuery({
    name: 'status',
    enum: PowerAccessApprovalStatus,
    required: false,
    examples: {
      allTypes: {
        value: null,
        description: 'Get approvals of all status',
      },
      APPROVED: {
        value: PowerAccessApprovalStatus.APPROVED,
        description: `Get all Power Access Approvals with status "${PowerAccessApprovalStatus.APPROVED}"`,
      },
      PENDING: {
        value: PowerAccessApprovalStatus.PENDING,
        description: `Get all Power Access Approvals with status "${PowerAccessApprovalStatus.PENDING}"`,
      },
      REJECTED: {
        value: PowerAccessApprovalStatus.REJECTED,
        description: `Get all Power Access Approvals with status "${PowerAccessApprovalStatus.REJECTED}"`,
      },
    },
  })
  getCompaniesWithPowerAccessApproval(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
    @Query('status') powerAccessApprovalStatus: PowerAccessApprovalStatus,
  ): Promise<PowerAccessApprovalDto[]> {
    return this.powerAccessApprovalService.readByUserAndStatus(authenticatedUser.sub, powerAccessApprovalStatus);
  }

  @Get('requests')
  @ApiQuery({
    name: 'status',
    enum: PowerAccessApprovalStatus,
    required: false,
    examples: {
      allTypes: {
        value: null,
        description: 'Get requests of all status',
      },
      APPROVED: {
        value: PowerAccessApprovalStatus.APPROVED,
        description: `Get all PPA Requests with status "${PowerAccessApprovalStatus.APPROVED}"`,
      },
      PENDING: {
        value: PowerAccessApprovalStatus.PENDING,
        description: `Get all PPA Requests with status "${PowerAccessApprovalStatus.PENDING}"`,
      },
      REJECTED: {
        value: PowerAccessApprovalStatus.REJECTED,
        description: `Get all  PPA Requests with status "${PowerAccessApprovalStatus.REJECTED}"`,
      },
    },
  })
  @ApiQuery({
    name: 'role',
    enum: PpaRequestRole,
    required: false,
    examples: {
      allTypes: {
        value: null,
        description: 'Get requests of all status',
      },
      SENDER: {
        value: PpaRequestRole.SENDER,
        description: `Get all PPA Requests where the authenticated user is the sender"`,
      },
      RECEIVER: {
        value: PpaRequestRole.RECEIVER,
        description: `Get all PPA Requests where the authenticated user is the receiver"`,
      },
    },
  })
  getPPARequest(
    @Query('role') _role: PpaRequestRole,
    @Query('status') _status: PowerAccessApprovalStatus,
  ): PpaRequestDto[] {
    return [];
  }
}
