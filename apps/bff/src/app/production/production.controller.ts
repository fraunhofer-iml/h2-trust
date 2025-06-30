import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { CreateProductionDto, ProductionOverviewDto } from '@h2-trust/api';
import { ProductionService } from './production.service';

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
  async createProduction(@Body() dto: CreateProductionDto): Promise<ProductionOverviewDto[]> {
    return this.service.createProduction(dto);
  }
}
