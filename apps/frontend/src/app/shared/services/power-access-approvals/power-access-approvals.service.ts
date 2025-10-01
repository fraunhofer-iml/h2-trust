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
import { PowerAccessApprovalDto, PowerAccessApprovalStatus } from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class PowerAccessApprovalService {
  constructor(private readonly httpClient: HttpClient) {}

  getApprovals(status?: PowerAccessApprovalStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    return lastValueFrom(this.httpClient.get<PowerAccessApprovalDto[]>(API.POWER_ACCESS_APPROVALS.BASE, { params }));
  }
}
