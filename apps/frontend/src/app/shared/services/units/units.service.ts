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
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto,
  PowerProductionOverviewDto,
  PowerProductionUnitDto,
  PowerProductionUnitInputDto,
  UnitInputDto,
  UnitUpdateActiveDto,
} from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class UnitsService {
  constructor(private readonly httpClient: HttpClient) {}

  getHydrogenProductionUnits() {
    return lastValueFrom(this.httpClient.get<HydrogenProductionOverviewDto[]>(API.UNITS.HYDROGEN_PRODUCTION.BASE));
  }

  getPowerProductionUnits() {
    return lastValueFrom(this.httpClient.get<PowerProductionOverviewDto[]>(API.UNITS.POWER_PRODUCTION.BASE));
  }

  getHydrogenStorageUnits() {
    return lastValueFrom(this.httpClient.get<HydrogenStorageOverviewDto[]>(API.UNITS.HYDROGEN_STORAGE.BASE));
  }

  createHydrogenStorageUnit(dto: UnitInputDto) {
    return lastValueFrom(this.httpClient.post<HydrogenStorageOverviewDto[]>(API.UNITS.HYDROGEN_STORAGE.BASE, dto));
  }

  createPowerProductionUnit(dto: PowerProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.post<PowerProductionOverviewDto[]>(API.UNITS.POWER_PRODUCTION.BASE, dto));
  }

  createHydrogenProductionUnit(dto: HydrogenProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.post<PowerProductionOverviewDto[]>(API.UNITS.HYDROGEN_PRODUCTION.BASE, dto));
  }

  getHydrogenStorageUnit(id: string) {
    return lastValueFrom(this.httpClient.get<HydrogenStorageUnitDto>(API.UNITS.HYDROGEN_STORAGE.DETAILS(id)));
  }

  getPowerProductionUnit(id: string) {
    return lastValueFrom(this.httpClient.get<PowerProductionUnitDto>(API.UNITS.POWER_PRODUCTION.DETAILS(id)));
  }

  getHydrogenProductionUnit(id: string) {
    return lastValueFrom(this.httpClient.get<HydrogenProductionUnitDto>(API.UNITS.HYDROGEN_PRODUCTION.DETAILS(id)));
  }

  updateActive(id: string, active: boolean) {
    const dto: UnitUpdateActiveDto = { active };
    return lastValueFrom(this.httpClient.patch<void>(API.UNITS.ACTIVE(id), dto));
  }

  updatePowerProductionUnit(id: string, dto: PowerProductionUnitInputDto) {
    const params = new HttpParams().set('unitId', id);
    return lastValueFrom(this.httpClient.put<PowerProductionUnitDto>(API.UNITS.POWER_PRODUCTION.BASE, dto, { params }));
  }

  updateHydrogenStorageUnit(id: string, dto: HydrogenStorageUnitInputDto) {
    const params = new HttpParams().set('unitId', id);
    return lastValueFrom(this.httpClient.put<HydrogenStorageUnitDto>(API.UNITS.HYDROGEN_STORAGE.BASE, dto, { params }));
  }

  updateHydrogenProductionUnit(id: string, dto: HydrogenProductionUnitInputDto) {
    const params = new HttpParams().set('unitId', id);
    return lastValueFrom(
      this.httpClient.put<HydrogenProductionUnitDto>(API.UNITS.HYDROGEN_PRODUCTION.BASE, dto, {
        params,
      }),
    );
  }
}
