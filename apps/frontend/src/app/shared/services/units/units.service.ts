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
} from '@h2-trust/api';
import { UnitType } from '@h2-trust/domain';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class UnitsService {
  constructor(private readonly httpClient: HttpClient) {}

  getHydrogenProductionUnits() {
    return lastValueFrom(
      this.httpClient.get<HydrogenProductionOverviewDto[]>(API.UNITS.HYDROGEN_PRODUCTION.BASE, {
        params: this.generateQueryParams(UnitType.HYDROGEN_PRODUCTION),
      }),
    );
  }

  getPowerProductionUnits(companyId?: string) {
    let params = this.generateQueryParams(UnitType.POWER_PRODUCTION);
    if (companyId) params = params.append('companyId', companyId);

    return lastValueFrom(
      this.httpClient.get<PowerProductionOverviewDto[]>(API.UNITS.POWER_PRODUCTION.BASE, {
        params: params,
      }),
    );
  }

  getHydrogenStorageUnits() {
    return lastValueFrom(
      this.httpClient.get<HydrogenStorageOverviewDto[]>(API.UNITS.HYDROGEN_STORAGE.BASE, {
        params: this.generateQueryParams(UnitType.HYDROGEN_STORAGE),
      }),
    );
  }

  // TODO:
  createUnit(dto: UnitCreateDto) {
    return lastValueFrom(this.httpClient.post<HydrogenStorageOverviewDto[]>(API.UNITS.POWER_PRODUCTION.BASE, dto));
  }

  getUnitById(id: string) {
    return lastValueFrom(this.httpClient.get<UnitDto>(API.UNITS.POWER_PRODUCTION.DETAILS(id)));
  }

  private generateQueryParams(unitType: UnitType): HttpParams {
    let params = new HttpParams();
    params = params.append('unit-type', String(unitType));
    return params;
  }
}
