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
  CreateProductionDto,
  ImportSubmissionDto,
  IntervallMatchingResultDto,
  ProductionOverviewDto,
} from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class ProductionService {
  constructor(private readonly httpClient: HttpClient) {}

  getProductions() {
    return lastValueFrom(this.httpClient.get<ProductionOverviewDto[]>(API.PRODUCTION.BASE));
  }

  addProductionData(dto: CreateProductionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(API.PRODUCTION.BASE, dto));
  }

  uploadCsv(data: FormData) {
    return lastValueFrom(this.httpClient.post<IntervallMatchingResultDto>(API.PRODUCTION.CSV, data));
  }

  submitCsv(dto: ImportSubmissionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(API.PRODUCTION.CSV_SUBMIT, dto));
  }
}
