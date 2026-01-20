/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  HydrogenProductionOverviewDto,
  HydrogenProductionUnitCreateDto,
  HydrogenProductionUnitDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitDto,
  PowerProductionOverviewDto,
  PowerProductionUnitCreateDto,
  PowerProductionUnitDto,
  UnitCreateDto,
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

  createHydrogenStorageUnit(dto: UnitCreateDto) {
    return lastValueFrom(this.httpClient.post<HydrogenStorageOverviewDto[]>(API.UNITS.HYDROGEN_STORAGE.BASE, dto));
  }

  createPowerProductionUnit(dto: PowerProductionUnitCreateDto) {
    return lastValueFrom(this.httpClient.post<PowerProductionOverviewDto[]>(API.UNITS.POWER_PRODUCTION.BASE, dto));
  }

  createHydrogenProductionUnit(dto: HydrogenProductionUnitCreateDto) {
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
}
