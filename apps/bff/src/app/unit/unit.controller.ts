/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Body, Controller, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { KeycloakUser } from 'nest-keycloak-connect';
import {
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto,
  HydrogenTransportUnitDto,
  HydrogenTransportUnitInputDto,
  PowerProductionUnitDto,
  PowerProductionUnitInputDto,
  UnitDto,
  UnitOverviewDto,
  UnitUpdateActiveDto,
  type AuthenticatedKCUser,
} from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all units of the authenticated user. Optionally filter by unit type.',
  })
  @ApiOkResponse({
    description: 'Returns a list of all units of the authenticated user.',
  })
  @ApiQuery({
    name: 'type',
    enum: UnitType,
    examples: {
      allTypes: {
        value: null,
        description: 'Get all units of all types',
      },
      APPROVED: {
        value: UnitType.POWER_PRODUCTION,
        description: `Get all Power Production Units"`,
      },
    },
  })
  getUnits(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Query('type') type?: UnitType,
  ): Promise<UnitOverviewDto[]> {
    return this.unitService.readUnits(authenticatedUser.sub, type);
  }

  @Post('hydrogen-storage')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createHydrogenStorageUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Body() dto: HydrogenStorageUnitInputDto,
  ): Promise<HydrogenStorageUnitDto> {
    return this.unitService.createHydrogenStorageUnit(dto, authenticatedUser.sub);
  }

  @Post('power-production')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createPowerProductionUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Body() dto: PowerProductionUnitInputDto,
  ): Promise<PowerProductionUnitDto> {
    return this.unitService.createPowerProductionUnit(dto, authenticatedUser.sub);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve a unit by id',
  })
  @ApiOkResponse({
    description: 'Returns the unit with the matching id.',
  })
  getUnitById(@Param('id') id: string): Promise<UnitDto> {
    return this.unitService.readUnitById(id);
  }

  @Post('hydrogen-transport')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createHydrogenTransportUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Body() dto: HydrogenTransportUnitInputDto,
  ): Promise<HydrogenTransportUnitDto> {
    return this.unitService.createHydrogenTransportUnit(dto, authenticatedUser.sub);
  }

  @Post('hydrogen-production')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createHydrogenProductionUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Body() dto: HydrogenProductionUnitInputDto,
  ): Promise<HydrogenProductionUnitDto> {
    return this.unitService.createHydrogenProductionUnit(dto, authenticatedUser.sub);
  }

  @Patch(':id/active')
  @ApiBearerAuth()
  @ApiOperation({ description: 'Update the property active' })
  @ApiOkResponse({
    description: 'Returns void if status update was successful.',
  })
  updateUnitStatus(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Param('id') id: string,
    @Body() dto: UnitUpdateActiveDto,
  ): Promise<void> {
    return this.unitService.updateUnitStatus(id, dto.active, authenticatedUser.sub);
  }

  @Put('hydrogen-production/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Update a hydrogen production  Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the updated unit.',
  })
  updateHydrogenProductionUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Param('id') unitId: string,
    @Body() dto: HydrogenProductionUnitInputDto,
  ): Promise<void> {
    return this.unitService.updateHydrogenProductionUnit(unitId, dto, authenticatedUser.sub);
  }

  @Put('power-production/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Update a power production Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the updated unit.',
  })
  updatePowerProductionUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Param('id') unitId: string,
    @Body() dto: PowerProductionUnitInputDto,
  ): Promise<void> {
    return this.unitService.updatePowerProductionUnit(unitId, dto, authenticatedUser.sub);
  }

  @Put('hydrogen-storage/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Update a Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the hydrogen storage updated unit.',
  })
  updateHydrogenStorageUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Param('id') unitId: string,
    @Body() dto: HydrogenStorageUnitInputDto,
  ): Promise<void> {
    return this.unitService.updateHydrogenStorageUnit(unitId, dto, authenticatedUser.sub);
  }

  @Put('hydrogen-transport/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Update a Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the hydrogen transport updated unit.',
  })
  updateHydrogenTransportUnit(
    @KeycloakUser() authenticatedUser: AuthenticatedKCUser,
    @Param('id') unitId: string,
    @Body() dto: HydrogenTransportUnitInputDto,
  ): Promise<void> {
    return this.unitService.updateHydrogenTransportUnit(unitId, dto, authenticatedUser.sub);
  }
}
