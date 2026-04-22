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
  PowerPurchaseAgreementDto,
  PpaRequestCreateDto,
  PpaRequestDto,
  UserDetailsDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { PowerProductionType, PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

@Controller('power-purchase-agreements')
export class PowerPurchaseAgreementController {
  constructor(private readonly powerPurchaseAgreementService: PowerPurchaseAgreementService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all companies with their power purchase agreement. Optionally filter by agreement status.',
  })
  @ApiOkResponse({
    description: 'Returns a list of all companies with their power purchase agreement matching the filter criteria.',
    type: [PowerPurchaseAgreementDto],
  })
  @ApiQuery({
    name: 'status',
    enum: PowerPurchaseAgreementStatus,
    required: false,
    examples: {
      allTypes: {
        value: null,
        description: 'Get agreements of all status',
      },
      APPROVED: {
        value: PowerPurchaseAgreementStatus.APPROVED,
        description: `Get all Power Agreements with status "${PowerPurchaseAgreementStatus.APPROVED}"`,
      },
      PENDING: {
        value: PowerPurchaseAgreementStatus.PENDING,
        description: `Get all Power Agreements with status "${PowerPurchaseAgreementStatus.PENDING}"`,
      },
      REJECTED: {
        value: PowerPurchaseAgreementStatus.REJECTED,
        description: `Get all Power Agreements with status "${PowerPurchaseAgreementStatus.REJECTED}"`,
      },
    },
  })
  getCompaniesWithPowerPurchaseAgreement(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
    @Query('status') powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus,
  ): Promise<PowerPurchaseAgreementDto[]> {
    return this.powerPurchaseAgreementService.readByUserAndStatus(authenticatedUser.sub, powerPurchaseAgreementStatus);
  }

  //TODO: Add id to query params since only ppas that are meant for you should be retrieved
  @Get('requests')
  getPPARequest(
    @Query('role') _role: PpaRequestRole,
    @Query('status') _status: PowerPurchaseAgreementStatus,
  ): PpaRequestDto[] {
    return [
      {
        createdAt: new Date(),
        id: '456867',
        powerProductionType: PowerProductionType.HYDRO_POWER_PLANT,
        receiver: { name: 'Test' } as CompanyDto,
        sender: { name: 'hans ', company: { name: 'testo test ' } } as UserDetailsDto,
        status: PowerPurchaseAgreementStatus.PENDING,
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
