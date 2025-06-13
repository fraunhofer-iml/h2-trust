import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateProductionDto, ProcessType, ProductionOverviewDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProductionService {
  constructor(private readonly httpClient: HttpClient) {}

  getProductionOverview() {
    let params = new HttpParams();
    params = params.append('processType', ProcessType.HYDROGEN_PRODUCTION);

    return lastValueFrom(
      this.httpClient.get<ProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.production.getProduction}`, {
        params: params,
      }),
    );
  }

  addProductionData(dto: CreateProductionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(`${BASE_URL}${'/productions'}`, dto));
  }
}
