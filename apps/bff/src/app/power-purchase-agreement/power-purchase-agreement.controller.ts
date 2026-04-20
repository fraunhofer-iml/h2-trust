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
import { PowerPurchaseAgreementDto, PpaRequestDto, type AuthenticatedKCUser } from '@h2-trust/api';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { PowerPurchaseAgreementService } from './power-purchase-agreement.service';

@Controller('power-purchase-agreements')
export class PowerPurchaseAgreementController {
  constructor(private readonly powerPurchaseAgreementService: PowerPurchaseAgreementService) {}

  /*   @Get()
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
  //Is this naming up to date?
  getCompaniesWithPowerPurchaseAgreement(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
    @Query('status') powerPurchaseAgreementStatus: PowerPurchaseAgreementStatus,
  ): Promise<PowerPurchaseAgreementDto[]> {
    return this.powerPurchaseAgreementService.readByUserAndStatus(authenticatedUser.sub, powerPurchaseAgreementStatus);
  } */

  @Get('requests')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all companies with their power purchase agreement. Optionally filter by agreement status.',
  })
  @ApiOkResponse({
    description: 'Returns a list of all companies with their power purchase agreement matching the filter criteria.',
    type: [PowerPurchaseAgreementDto],
  })
  @ApiQuery({
    name: 'role',
    enum: PpaRequestRole,
    required: true,
    examples: {
      allTypes: {
        value: null,
        description: 'Possible roles to request ppas"s with',
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
  getPPARequest(
    @AuthenticatedUser() user: AuthenticatedKCUser,
    @Query('role') role: PpaRequestRole,
    @Query('status') status?: PowerPurchaseAgreementStatus,
  ): Promise<PpaRequestDto[]> {
    return this.powerPurchaseAgreementService.readAll(user.sub, role, status);
  }

  /*   @Post('requests')
  @ApiOkResponse({ description: 'Returns created Request', type: PpaRequestDto })
  createPpaRequest(
    @Body() dto: PpaRequestCreateDto,
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<PpaRequestDto> {
    return this.powerPurchaseAgreementService.createPPA(dto, authenticatedUser.sub);
  }

  @Patch('requests/:id')
  @ApiOkResponse({ description: 'Returns Request that were rejected or denied', type: PpaRequestDto })
  @ApiParam({ name: 'id', description: 'Id of PPA Request to update' })
  closePpaRequest(
    @Body() dto: PpaRequestDto,
        @Param('id') powerPurchaseAgreementRequestId: string,
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ): Promise<PpaRequestDto> {
    return this.powerPurchaseAgreementService.updatePPA(dto, user.sub);
  } */
}
