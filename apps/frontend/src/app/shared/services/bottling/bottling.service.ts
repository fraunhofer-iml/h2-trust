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
import { BottlingOverviewDto, ProductPassportDto } from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class BottlingService {
  constructor(private readonly httpClient: HttpClient) {}

  getBottlings() {
    return lastValueFrom(this.httpClient.get<BottlingOverviewDto[]>(API.BOTTLING.BASE));
  }

  createBottleBatch(data: FormData) {
    return lastValueFrom(this.httpClient.post<BottlingOverviewDto>(API.BOTTLING.BASE, data));
  }

  findBatchById(id: string): Promise<ProductPassportDto> {
    return lastValueFrom(this.httpClient.get<ProductPassportDto>(API.BOTTLING.DETAILS(id)));
  }
}
