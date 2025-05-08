import { Injectable } from '@nestjs/common';
import { ProductionOverviewDto, PRODUCTIONOVERVIEWMOCK } from '@h2-trust/api';

@Injectable()
export class ProductionService {
  getCompanyProductionData(): Promise<ProductionOverviewDto[]> {
    return Promise.resolve(PRODUCTIONOVERVIEWMOCK);
  }
}
