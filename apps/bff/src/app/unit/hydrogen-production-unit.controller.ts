import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import {
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitCreateDto,
  HydrogenStorageUnitDto,
  type AuthenticatedKCUser,
} from '@h2-trust/api';
import { UnitService } from './unit.service';

@Controller('hydrogen-storage-units')
export class HydrogenStorageUnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
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

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve hydrogen-storage unit ',
  })
  @ApiOkResponse({
    description: 'Returns hydrogen-storage unit ',
  })
  getUnitById(@Param() id: string): Promise<HydrogenStorageUnitDto> {
    return this.unitService.readHydrogenStorageUnit(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create new Unit.',
  })
  @ApiOkResponse({
    description: 'Returns the created unit.',
  })
  createUnit(@Body() dto: HydrogenStorageUnitCreateDto): Promise<HydrogenStorageUnitDto> {
    return this.unitService.createHydrogenStorageUnit(dto);
  }
}
