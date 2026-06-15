/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  ComponentsOverviewDto,
  HydrogenBottlingOverviewDto,
  HydrogenBottlingUnitDto,
  HydrogenBottlingUnitInputDto,
  HydrogenCompressorOverviewDto,
  HydrogenCompressorUnitDto,
  HydrogenCompressorUnitInputDto,
  HydrogenEndUseOverviewDto,
  HydrogenEndUseUnitDto,
  HydrogenEndUseUnitInputDto,
  HydrogenProductionUnitDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageOverviewDto,
  HydrogenStorageUnitDto,
  HydrogenStorageUnitInputDto,
  HydrogenTransportOverviewDto,
  HydrogenTransportUnitInputDto,
  PowerProductionOverviewDto,
  PowerProductionUnitDto,
  PowerProductionUnitInputDto,
  UnitDto,
  UnitInputDto,
  UnitOverviewDto,
  UnitUpdateActiveDto,
} from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class UnitsService {
  private readonly httpClient = inject(HttpClient);

  getUnits(type?: UnitType) {
    let params = new HttpParams();

    if (type) {
      params = params.set('type', type);
    }

    return lastValueFrom(this.httpClient.get<UnitOverviewDto[]>(API.UNITS.BASE, { params }));
  }

  createHydrogenStorageUnit(dto: UnitInputDto) {
    return lastValueFrom(this.httpClient.post<HydrogenStorageOverviewDto[]>(API.UNITS.HYDROGEN_STORAGE.BASE, dto));
  }

  createPowerProductionUnit(dto: PowerProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.post<PowerProductionOverviewDto[]>(API.UNITS.POWER_PRODUCTION.BASE, dto));
  }

  createHydrogenProductionUnit(dto: HydrogenProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.post<HydrogenStorageOverviewDto[]>(API.UNITS.HYDROGEN_PRODUCTION.BASE, dto));
  }

  createHydrogenCompressionUnit(dto: HydrogenCompressorUnitInputDto) {
    return lastValueFrom(
      this.httpClient.post<HydrogenCompressorOverviewDto[]>(API.UNITS.HYDROGEN_COMPRESSOR.BASE, dto),
    );
  }

  createHydrogenBottlingUnit(dto: HydrogenBottlingUnitInputDto) {
    return lastValueFrom(this.httpClient.post<HydrogenBottlingOverviewDto[]>(API.UNITS.HYDROGEN_BOTTLING.BASE, dto));
  }

  createHydrogenTransportUnit(dto: HydrogenTransportUnitInputDto) {
    return lastValueFrom(this.httpClient.post<HydrogenTransportOverviewDto[]>(API.UNITS.HYDROGEN_TRANSPORT.BASE, dto));
  }

  createHydrogenEndUseUnit(dto: HydrogenEndUseUnitInputDto) {
    return lastValueFrom(this.httpClient.post<HydrogenEndUseOverviewDto[]>(API.UNITS.HYDROGEN_END_USE.BASE, dto));
  }

  getUnitById(id: string) {
    return lastValueFrom(this.httpClient.get<UnitDto>(API.UNITS.BY_ID(id)));
  }

  getComponentOverviewById(id: string) {
    return lastValueFrom(this.httpClient.get<ComponentsOverviewDto>(API.UNITS.COMPONENT_OVERVIEW(id)));
  }

  // update unit status

  updateActive(id: string, active: boolean) {
    const dto: UnitUpdateActiveDto = { active };
    return lastValueFrom(this.httpClient.patch<void>(API.UNITS.ACTIVE(id), dto));
  }

  // update units

  updatePowerProductionUnit(id: string, dto: PowerProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.put<PowerProductionUnitDto>(API.UNITS.POWER_PRODUCTION.BY_ID(id), dto));
  }

  updateHydrogenStorageUnit(id: string, dto: HydrogenStorageUnitInputDto) {
    return lastValueFrom(this.httpClient.put<HydrogenStorageUnitDto>(API.UNITS.HYDROGEN_STORAGE.BY_ID(id), dto));
  }

  updateHydrogenProductionUnit(id: string, dto: HydrogenProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.put<HydrogenProductionUnitDto>(API.UNITS.HYDROGEN_PRODUCTION.BY_ID(id), dto));
  }

  updateHydrogenCompressorUnit(id: string, dto: HydrogenCompressorUnitInputDto) {
    return lastValueFrom(this.httpClient.put<HydrogenCompressorUnitDto>(API.UNITS.HYDROGEN_COMPRESSOR.BY_ID(id), dto));
  }

  updateHydrogenBottlingUnit(id: string, dto: HydrogenBottlingUnitInputDto) {
    return lastValueFrom(this.httpClient.put<HydrogenBottlingUnitDto>(API.UNITS.HYDROGEN_BOTTLING.BY_ID(id), dto));
  }

  updateHydrogenTransportUnit(id: string, dto: HydrogenProductionUnitInputDto) {
    return lastValueFrom(this.httpClient.put<HydrogenProductionUnitDto>(API.UNITS.HYDROGEN_TRANSPORT.BY_ID(id), dto));
  }

  updateHydrogenEndUseUnit(id: string, dto: HydrogenEndUseUnitInputDto) {
    return lastValueFrom(this.httpClient.put<HydrogenEndUseUnitDto>(API.UNITS.HYDROGEN_END_USE.BY_ID(id), dto));
  }
}
