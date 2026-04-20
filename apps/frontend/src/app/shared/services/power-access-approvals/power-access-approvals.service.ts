/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PowerAccessApprovalDto, PpaRequestCreateDto, PpaRequestDecisionDto, PpaRequestDto } from '@h2-trust/contracts';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class PowerAccessApprovalService {
  private readonly httpClient = inject(HttpClient);

  getApprovals(status?: PowerAccessApprovalStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    return lastValueFrom(this.httpClient.get<PowerAccessApprovalDto[]>(API.POWER_ACCESS_APPROVALS.BASE, { params }));
  }

  getPpaRequests(role: PpaRequestRole, status?: PowerAccessApprovalStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }

    if (role) {
      params = params.append('role', role);
    }

    return lastValueFrom(this.httpClient.get<PpaRequestDto[]>(API.POWER_ACCESS_APPROVALS.REQUESTS, { params }));
  }

  createPpaRequest(dto: PpaRequestCreateDto) {
    return lastValueFrom(this.httpClient.post<PpaRequestDto[]>(API.POWER_ACCESS_APPROVALS.REQUESTS, dto));
  }

  decidePpaRequest(requestId: string, dto: PpaRequestDecisionDto) {
    return lastValueFrom(
      this.httpClient.patch<PpaRequestDto>(API.POWER_ACCESS_APPROVALS.REQUESTS_SINGLE(requestId), dto),
    );
  }
}
