import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitCreateDto,
  HydrogenProductionUnitDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitCreateDto,
  HydrogenStorageUnitDto,
  PowerProductionOverviewDto,
  PowerProductionUnitCreateDto,
  PowerProductionUnitDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get('hydrogen-storage')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all hydrogen-storage units of the authenticated user',
  })
  @ApiOkResponse({
    description: 'Returns a list of all hydrogen-storage units of the authenticated user ',
  })
  getHydrogenStorageUnits(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<HydrogenStorageOverviewDto[]> {
    return this.unitService.readHydrogenStorageUnits(authenticatedUser.sub);
  }

  @Get('hydrogen-storage/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve hydrogen-storage unit ',
  })
  @ApiOkResponse({
    description: 'Returns hydrogen-storage unit ',
  })
  getHydrogenStorageUnitById(@Param('id') id: string): Promise<HydrogenStorageUnitDto> {
    return this.unitService.readHydrogenStorageUnit(id);
  }

  @Post('hydrogen-storage')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createHydrogenStorageUnit(@Body() dto: HydrogenStorageUnitCreateDto): Promise<HydrogenStorageUnitDto> {
    return this.unitService.createHydrogenStorageUnit(dto);
  }

  @Get('power-production')
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

  @Get('power-production/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve power-production unit ',
  })
  @ApiOkResponse({
    description: 'Returns power-production unit ',
  })
  getPowerProductionUnitById(@Param('id') id: string): Promise<PowerProductionUnitDto> {
    return this.unitService.readPowerProductionUnit(id);
  }

  @Post('power-production')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createPowerProductionUnit(@Body() dto: PowerProductionUnitCreateDto): Promise<PowerProductionUnitDto> {
    return this.unitService.createPowerProductionUnit(dto);
  }

  @Get('hydrogen-production')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all hydrogen-storage units of the authenticated user',
  })
  @ApiOkResponse({
    description: 'Returns a list of all hydrogen-storage units of the authenticated user ',
  })
  getHydrogenProductionUnits(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<HydrogenProductionOverviewDto[]> {
    return this.unitService.readHydrogenProductionUnits(authenticatedUser.sub);
  }

  @Get('hydrogen-production/:id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve hydrogen-storage unit ',
  })
  @ApiOkResponse({
    description: 'Returns hydrogen-storage unit ',
  })
  getHydrogenProductionUnitById(@Param('id') id: string): Promise<HydrogenProductionUnitDto> {
    return this.unitService.readHydrogenProductionUnit(id);
  }

  @Post('hydrogen-production')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createHydrogenProductionUnit(@Body() dto: HydrogenProductionUnitCreateDto): Promise<HydrogenProductionUnitDto> {
    return this.unitService.createHydrogenProductionUnit(dto);
  }
}
