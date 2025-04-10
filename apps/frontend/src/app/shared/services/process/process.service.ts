import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProcessingOverviewDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ProcessFilter } from '../../../model/process-filter';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProcessService {
  constructor(private readonly httpClient: HttpClient) {}

  getProcessesOfCompany(filter?: ProcessFilter) {
    return this.httpClient.get<ProcessingOverviewDto[]>(`${BASE_URL}${ApiEndpoints.process.getProcesses}`, {
      params: this.generateQueryParametersForProcesses(filter),
    });
  }

  private generateQueryParametersForProcesses(filter?: ProcessFilter): HttpParams {
    let params = new HttpParams();
    if (filter) {
      if (filter.companyId) {
        params = params.append('companyId', filter.companyId);
      }
      if (filter.active) {
        params = params.append('active', filter.active);
      }
      if (filter.processName) {
        params = params.append('processName', filter.processName);
      }
    }
    return params;
  }
}
