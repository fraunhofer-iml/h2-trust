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
import { CreateProductionDto, ProductionOverviewDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProductionService {
  constructor(private readonly httpClient: HttpClient) {}

  getProductions() {
    return lastValueFrom(this.httpClient.get<ProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.PRODUCTIONS}`));
  }

  addProductionData(dto: CreateProductionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(`${BASE_URL}${ApiEndpoints.PRODUCTIONS}`, dto));
  }
}
