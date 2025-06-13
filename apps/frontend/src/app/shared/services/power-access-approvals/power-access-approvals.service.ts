import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PowerAccessApprovalDto, PowerAccessApprovalStatus } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';

@Injectable()
export class PowerAccessApprovalService {
  constructor(private readonly httpClient: HttpClient) {}

  getApprovals(status?: PowerAccessApprovalStatus) {
    let params = new HttpParams();
    if (status) {
      params = params.append('status', status);
    }
    return lastValueFrom(
      this.httpClient.get<PowerAccessApprovalDto[]>(`${BASE_URL}${'/power-access-approvals'}`, { params }),
    );
  }
}
