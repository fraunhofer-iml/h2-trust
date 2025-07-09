import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateProductionDto, ProductionOverviewDto, type AuthenticatedKCUser, } from '@h2-trust/api';
import { ProductionService } from './production.service';
import { AuthenticatedUser } from 'nest-keycloak-connect';

@Controller('productions')
export class ProductionController {
  constructor(private readonly service: ProductionService) { }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ description: 'Create a new production entry' })
  @ApiCreatedResponse({ description: 'Production created.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productionStartedAt: { type: 'string', default: '2025-01-01T10:00:00Z' },
        productionEndedAt: { type: 'string', default: '2025-01-01T11:00:00Z' },
        powerProductionUnitId: { type: 'string', default: 'power-production-unit-1' },
        powerAmountKwh: { type: 'number', default: 10 },
        hydrogenProductionUnitId: { type: 'string', default: 'hydrogen-production-unit-1' },
        hydrogenAmountKg: { type: 'number', default: 5 },
      },
    },
  })
  async createProduction(@Body() dto: CreateProductionDto, @AuthenticatedUser() user: AuthenticatedKCUser): Promise<ProductionOverviewDto[]> {
    return this.service.createProduction(dto, user.sub);
  }
}
