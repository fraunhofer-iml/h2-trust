import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  PowerProductionOverviewDto,
  UnitType,
} from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class UnitsService {
  constructor(private readonly httpClient: HttpClient) {}

  getHydrogenProductionUnits() {
    return lastValueFrom(
      this.httpClient.get<HydrogenProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.units}`, {
        params: this.generateQueryParams(UnitType.hydrogenProductionUnit),
      }),
    );
  }
  getPowerProductionUnits() {
    return lastValueFrom(
      this.httpClient.get<PowerProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.units}`, {
        params: this.generateQueryParams(UnitType.powerProductionUnit),
      }),
    );
  }

  getHydrogenStorageUnits() {
    return lastValueFrom(
      this.httpClient.get<HydrogenStorageOverviewDto[]>(`${BASE_URL}${ApiEndpoints.units}`, {
        params: this.generateQueryParams(UnitType.hydrogenStorageUnit),
      }),
    );
  }

  private generateQueryParams(unitType: UnitType): HttpParams {
    let params = new HttpParams();
    params = params.append('unit-type', String(unitType));
    return params;
  }
}
