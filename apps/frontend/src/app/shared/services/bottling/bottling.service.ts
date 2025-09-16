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
import { BottlingOverviewDto, ProductPassDto, ProofOfSustainabilityDto, SectionDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class BottlingService {
  constructor(private readonly httpClient: HttpClient) {}

  getBottlings() {
    return lastValueFrom(this.httpClient.get<BottlingOverviewDto[]>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}`));
  }

  createBottleBatch(data: FormData) {
    return lastValueFrom(this.httpClient.post<BottlingOverviewDto>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}`, data));
  }

  findBatchById(id: string): Promise<ProductPassDto> {
    return lastValueFrom(this.httpClient.get<ProductPassDto>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}/${id}`));
  }

  getProofOfOrigin(id: string): Promise<SectionDto[]> {
    return lastValueFrom(
      this.httpClient.get<SectionDto[]>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}/${id}/proof-of-origin`),
    );
  }
  getProofOfSustainability(id: string): Promise<ProofOfSustainabilityDto> {
    return lastValueFrom(
      this.httpClient.get<ProofOfSustainabilityDto>(
        `${BASE_URL}${ApiEndpoints.BOTTLINGS}/${id}/proof-of-sustainability`,
      ),
    );
  }
}
