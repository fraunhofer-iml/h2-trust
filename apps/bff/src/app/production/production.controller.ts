import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CreateProductionDto, ProductionOverviewDto, type AuthenticatedKCUser } from '@h2-trust/api';
import { ProductionService } from './production.service';

@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Create power and hydrogen process steps.',
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
          default: '2025-01-01T10:00:00Z',
        },
        productionEndedAt: {
          type: 'string',
          default: '2025-01-01T11:00:00Z',
        },
        powerProductionUnitId: {
          type: 'string',
          default: 'power-production-unit-1',
        },
        powerAmountKwh: {
          type: 'number',
          default: 10,
        },
        hydrogenProductionUnitId: {
          type: 'string',
          default: 'hydrogen-production-unit-1',
        },
        hydrogenAmountKg: {
          type: 'number',
          default: 5,
        },
      },
    },
  })
  async createProduction(
    @Body() dto: CreateProductionDto,
    @AuthenticatedUser() user: AuthenticatedKCUser,
  ): Promise<ProductionOverviewDto[]> {
    return this.service.createProduction(dto, user.sub);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    description: "Retrieve all hydrogen productions for the authenticated user's company.",
  })
  @ApiOkResponse({
    description: "Returns a list of all hydrogen productions belonging to the authenticated user's company.",
    type: [ProductionOverviewDto],
  })
  async readHydrogenProductionsByCompany(
    @AuthenticatedUser() authenticatedUser: AuthenticatedKCUser,
  ): Promise<ProductionOverviewDto[]> {
    return this.service.readHydrogenProductionsByCompany(authenticatedUser.sub);
  }
}
