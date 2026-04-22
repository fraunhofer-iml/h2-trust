/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { CompanyDto } from '@h2-trust/contracts/dtos';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class CompaniesService {
  private readonly httpClient = inject(HttpClient);

  getCompanies() {
    return lastValueFrom(this.httpClient.get<CompanyDto[]>(API.COMPANIES.BASE));
  }
}
