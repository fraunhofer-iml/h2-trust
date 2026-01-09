import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  PowerProductionOverviewDto,
  PowerProductionUnitCreateDto,
  PowerProductionUnitDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { UnitService } from './unit.service';

@Controller('power-production-unit')
export class PowerProductionUnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all power-production units of the authenticated user',
  })
  @ApiOkResponse({
    description: 'Returns a list of all power-production units of the authenticated user ',
  })
  getPowerProductionUnits(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<PowerProductionOverviewDto[]> {
    return this.unitService.readPowerProductionUnits(authenticatedUser.sub);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve power-production unit ',
  })
  @ApiOkResponse({
    description: 'Returns power-production unit ',
  })
  getUnitById(@Param() id: string): Promise<PowerProductionUnitDto> {
    return this.unitService.readPowerProductionUnit(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createUnit(@Body() dto: PowerProductionUnitCreateDto): Promise<PowerProductionUnitDto> {
    return this.unitService.createPowerProductionUnit(dto);
  }
}
