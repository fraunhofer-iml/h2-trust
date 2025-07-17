import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CreateProductionDto, ProductionOverviewDto, type AuthenticatedKCUser } from '@h2-trust/api';
import { ProductionService } from './production.service';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create power and hydrogen process steps.'
  })
  @ApiCreatedResponse({
    description: 'Returns the newly created power and hydrogen process steps.',
    type: [ProductionOverviewDto],
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productionStartedAt: {
          type: 'string',
          default: '2025-01-01T10:00:00Z'
        },
        productionEndedAt: {
          type: 'string',
          default: '2025-01-01T11:00:00Z'
        },
        powerProductionUnitId: {
          type: 'string',
          default: 'power-production-unit-1'
        },
        powerAmountKwh: {
          type: 'number',
          default: 10
        },
        hydrogenProductionUnitId: {
          type: 'string',
          default: 'hydrogen-production-unit-1'
        },
        hydrogenAmountKg: {
          type: 'number',
          default: 5
        },
      },
    },
  })
  async createProduction(@Body() dto: CreateProductionDto): Promise<ProductionOverviewDto[]> {
    return this.service.createProduction(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Retrieve all hydrogen process steps for the authenticated user\'s company.'
  })
  @ApiOkResponse({
    description: 'Returns a list of all hydrogen process steps belonging to the authenticated user\'s company.',
    type: [ProductionOverviewDto],
  })
  async readHydrogenProcessStepsByCompany(@AuthenticatedUser() authenticatedUser: AuthenticatedKCUser): Promise<ProductionOverviewDto[]> {
    return this.service.readProductionsByCompany(authenticatedUser.sub);
  }
}
