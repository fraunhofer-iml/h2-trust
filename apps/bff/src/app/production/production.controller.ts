import { Controller, Get, Param } from '@nestjs/common';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private readonly productionService: ProductionService) {}

  @Get(':companyId')
  getProductionDataForCompany(@Param('companyId') companyId: string) {
    return this.productionService.getCompanyProductionData();
  }
}
