import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HydrogenProductionOverviewDto, HydrogenStorageOverviewDto, UnitType } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class UnitsService {
  constructor(private readonly httpClient: HttpClient) {}

  getHydrogenProductionUnitsOfCompany(companyId: string) {
    return this.httpClient.get<HydrogenProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.units}`, {
      params: this.generateQueryParametersForUnits(companyId, UnitType.hydrogenProductionUnit),
    });
  }

  getHydrogenStorageUnitsOfCompany(companyId: string) {
    return this.httpClient.get<HydrogenStorageOverviewDto[]>(`${BASE_URL}${ApiEndpoints.units}`, {
      params: this.generateQueryParametersForUnits(companyId, UnitType.hydrogenStorageUnit),
    });
  }

  generateQueryParametersForUnits(companyId: string, unitType: UnitType): HttpParams {
    let params = new HttpParams();
    params = params.append('companyId', companyId);
    params = params.append('unit-type', String(unitType));
    return params;
  }
}
