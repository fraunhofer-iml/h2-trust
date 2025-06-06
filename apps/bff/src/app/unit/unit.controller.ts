import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UnitDto, UnitOverviewDto, UnitType } from '@h2-trust/api';
import { UnitService } from './unit.service';

@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) { }

  @Get(':id')
  @ApiOperation({ description: 'Get one unit.' })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the unit.',
    example: 'hydrogen-storage-unit-1',
  })
  getUnit(@Param('id') id: string): Promise<UnitDto> {
    return this.unitService.readUnit(id);
  }

  @Get()
  @ApiOperation({
    description:
      'Get Units. If a company ID is provided, returns only that company’s units; otherwise, returns all units.',
  })
  @ApiOkResponse({ description: 'Successful request.' })
  @ApiQuery({
    name: 'company-id',
    type: String,
    required: false,
    examples: {
      allCompanies: { value: null, description: 'Get units from all companies' },
      companyHydrogen: {
        value: 'company-hydrogen-1',
        description: 'Get all units from company with id "company-hydrogen-1"',
      },
      companyPower: { value: 'company-power-1', description: 'Get all units from company with id "company-power-1"' },
    },
  })
  @ApiQuery({
    name: 'unit-type',
    enum: UnitType,
    required: false,
    examples: {
      allTypes: { value: null, description: 'Get units of all types' },
      powerProduction: {
        value: 'power-production',
        description: 'Get all units with type "power-production"',
      },
      hydrogenProduction: {
        value: 'hydrogen-production',
        description: 'Get all units with type "hydrogen-production"',
      },
      hydrogenStorage: {
        value: 'hydrogen-storage',
        description: 'Get all units with type "hydrogen-storage"',
      },
    },
  })
  getUnits(@Query('company-id') companyId: string, @Query('unit-type') unitType: UnitType): Promise<UnitOverviewDto[]> {
    return this.unitService.readUnits(companyId, unitType);
  }
}
