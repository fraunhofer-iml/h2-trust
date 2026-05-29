/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KeycloakUser } from 'nest-keycloak-connect';
import { BatchDto, PaginatedDataDto, type AuthenticatedKCUser } from '@h2-trust/contracts/dtos';
import { ProcessType, RfnboType, UnitType } from '@h2-trust/domain';

@Controller('batches')
export class BatchController {
  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all hydrogen batches for the authenticated user's company.",
  })
  @ApiQuery({
    name: 'pageNumber',
    type: Number,
    description: 'Used to get a specific page of pagination',
    required: false,
    minimum: 1,
    example: '1',
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: 'Used to define the amount of data retrieved',
    required: false,
    minimum: 5,
    example: '5',
  })
  @ApiQuery({
    name: 'id',
    type: String,
    description: 'Used to filter for a specific batch by its id',
    required: false,
    example: 'Hydrogen Electrolyzer Dortmund 001',
  })
  @ApiQuery({
    name: 'batchType',
    enum: UnitType,
    example: UnitType.BOTTLING,
    description: 'Used to filter for a specific batch type',
    required: false,
  })
  readAllHydrogenBatches(
    @Query('pageNumber') _pageNumber: number,
    @Query('pageSize') _pageSize: number,
    @Query('id') _from: string,
    @Query('batchType') _to: UnitType,
    @KeycloakUser() _authenticatedUser: AuthenticatedKCUser,
  ): Promise<PaginatedDataDto<BatchDto>> {
    return new Promise((resolve) => {
      resolve(
        new PaginatedDataDto<BatchDto>(
          [
            new BatchDto(
              'process-step-hydrogen-transportation-2',
              1000,
              new Date(),
              ProcessType.HYDROGEN_BOTTLING,
              RfnboType.RFNBO_READY,
            ),
            new BatchDto(
              'process-step-hydrogen-transportation-1',
              2000,
              new Date(),
              ProcessType.HYDROGEN_PRODUCTION,
              RfnboType.NON_CERTIFIABLE,
            ),
          ],
          2,
          1,
        ),
      );
    });
  }
}
