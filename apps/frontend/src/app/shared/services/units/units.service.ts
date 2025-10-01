/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  PowerProductionOverviewDto,
  UnitCreateDto,
  UnitDto,
  UnitType,
} from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class UnitsService {
  constructor(private readonly httpClient: HttpClient) {}

  getHydrogenProductionUnits() {
    return lastValueFrom(
      this.httpClient.get<HydrogenProductionOverviewDto[]>(API.UNITS.BASE, {
        params: this.generateQueryParams(UnitType.HYDROGEN_PRODUCTION),
      }),
    );
  }

  getPowerProductionUnits(companyId?: string) {
    let params = this.generateQueryParams(UnitType.POWER_PRODUCTION);
    if (companyId) params = params.append('companyId', companyId);

    return lastValueFrom(
      this.httpClient.get<PowerProductionOverviewDto[]>(API.UNITS.BASE, {
        params: params,
      }),
    );
  }

  getHydrogenStorageUnits() {
    return lastValueFrom(
      this.httpClient.get<HydrogenStorageOverviewDto[]>(API.UNITS.BASE, {
        params: this.generateQueryParams(UnitType.HYDROGEN_STORAGE),
      }),
    );
  }

  createUnit(dto: UnitCreateDto) {
    return lastValueFrom(this.httpClient.post<HydrogenStorageOverviewDto[]>(API.UNITS.BASE, dto));
  }

  getUnitById(id: string) {
    return lastValueFrom(this.httpClient.get<UnitDto>(API.UNITS.DETAILS(id)));
  }

  private generateQueryParams(unitType: UnitType): HttpParams {
    let params = new HttpParams();
    params = params.append('unit-type', String(unitType));
    return params;
  }
}
