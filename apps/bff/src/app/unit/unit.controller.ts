/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UnitCreateDto, UnitDto, UnitOverviewDto, UnitType, type AuthenticatedKCUser } from '@h2-trust/api';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all units of the authenticated user, optionally filtered by unit type.',
  })
  @ApiOkResponse({
    description: 'Returns a list of all units of the authenticated user matching the filter criteria.',
  })
  @ApiQuery({
    name: 'unit-type',
    enum: UnitType,
    required: false,
    examples: {
      allTypes: {
        value: null,
        description: 'Get units of all types',
      },
      powerProduction: {
        value: UnitType.POWER_PRODUCTION,
        description: `Get all units with type "${UnitType.POWER_PRODUCTION}"`,
      },
      hydrogenProduction: {
        value: UnitType.HYDROGEN_PRODUCTION,
        description: `Get all units with type "${UnitType.HYDROGEN_PRODUCTION}"`,
      },
      hydrogenStorage: {
        value: UnitType.HYDROGEN_STORAGE,
        description: `Get all units with type "${UnitType.HYDROGEN_STORAGE}"`,
      },
    },
  })
  getUnits(
    @Query('unit-type') unitType: UnitType,
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<UnitOverviewDto[]> {
    return this.unitService.readUnits(authenticatedUser.sub, unitType);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve a specific unit by its ID.',
  })
  @ApiOkResponse({
    description: 'Returns the requested unit.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique identifier of the unit.',
    example: 'hydrogen-storage-unit-1',
  })
  async getUnit(@Param('id') id: string): Promise<UnitDto> {
    return this.unitService.readUnit(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createUnit(@Body() dto: UnitCreateDto) {
    return this.unitService.createUnit(dto);
  }
}
