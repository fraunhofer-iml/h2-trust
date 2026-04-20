/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, NotImplementedException, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import {
  CompanyDto,
  PowerAccessApprovalDto,
  PpaRequestCreateDto,
  PpaRequestDto,
  UserDetailsDto,
  type AuthenticatedKCUser,
} from '@h2-trust/contracts/dtos';
import { PowerAccessApprovalStatus, PowerProductionType, PpaRequestRole } from '@h2-trust/domain';
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
  getPPARequest(
    @Query('role') _role: PpaRequestRole,
    @Query('status') _status: PowerAccessApprovalStatus,
  ): PpaRequestDto[] {
    return [
      {
        createdAt: new Date(),
        id: '456867',
        powerProductionType: PowerProductionType.HYDRO_POWER_PLANT,
        receiver: { name: 'Test' } as CompanyDto,
        sender: { name: 'hans ', company: { name: 'testo test ' } } as UserDetailsDto,
        status: PowerAccessApprovalStatus.PENDING,
        validFrom: new Date(),
        validTo: new Date(),
      },
    ];
  }

  @Post('requests')
  @ApiOkResponse({ description: 'Returns created Request', type: PpaRequestDto })
  createPpaRequest(@Body() _dto: PpaRequestCreateDto, @AuthenticatedUser() _user: AuthenticatedKCUser): PpaRequestDto {
    throw new NotImplementedException();
  }

  @Patch('requests/:id')
  @ApiOkResponse({ description: 'Returns Request that war rejected or denied', type: PpaRequestDto })
  @ApiParam({ name: 'id', description: 'Id of PPA Request to update' })
  closePpaRequest(
    @Body() _dto: PpaRequestDto,
    @Param('id') _id: string,
    @AuthenticatedUser() _user: AuthenticatedKCUser,
  ): PpaRequestDto {
    throw new NotImplementedException();
  }
}
