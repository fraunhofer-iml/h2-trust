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
import { PowerPurchaseAgreementDto, PpaRequestCreateDto, PpaRequestDecisionDto, PpaRequestDto } from '@h2-trust/api';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class PowerPurchaseAgreementService {
  constructor(private readonly httpClient: HttpClient) {}

  getAgreements(status?: PowerPurchaseAgreementStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    return lastValueFrom(
      this.httpClient.get<PowerPurchaseAgreementDto[]>(API.POWER_PURCHASE_AGREEMENTS.BASE, { params }),
    );
  }

  getPpaRequests(role: PpaRequestRole, status?: PowerPurchaseAgreementStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }

    if (role) {
      params = params.append('role', role);
    }

    return lastValueFrom(this.httpClient.get<PpaRequestDto[]>(API.POWER_PURCHASE_AGREEMENTS.REQUESTS, { params }));
  }

  createPpaRequest(dto: PpaRequestCreateDto) {
    return lastValueFrom(this.httpClient.post<PpaRequestDto[]>(API.POWER_PURCHASE_AGREEMENTS.REQUESTS, dto));
  }

  decidePpaRequest(requestId: string, dto: PpaRequestDecisionDto) {
    return lastValueFrom(
      this.httpClient.patch<PpaRequestDto>(API.POWER_PURCHASE_AGREEMENTS.REQUESTS_SINGLE(requestId), dto),
    );
  }
}
