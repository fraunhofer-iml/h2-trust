import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProcessType, ProductionOverviewDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProductionService {
  constructor(private readonly httpClient: HttpClient) {}

  getProductionOverview(companyId: string) {
    return this.httpClient.get<ProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.production.getProduction}`, {
      params: this.generateQueryParametersForProduction(companyId),
    });
  }

  generateQueryParametersForProduction(companyId: string): HttpParams {
    let params = new HttpParams();
    params = params.append('companyId', companyId);
    params = params.append('processType', ProcessType.HYDROGEN_PRODUCTION);
    return params;
  }
}
