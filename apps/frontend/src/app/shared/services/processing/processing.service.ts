import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BottlingDto, ProcessingOverviewDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ProcessingFilter } from '../../../model/process-filter';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProcessingService {
  constructor(private readonly httpClient: HttpClient) {}

  getProcessingDataOfCompany(filter?: ProcessingFilter) {
    return this.httpClient.get<ProcessingOverviewDto[]>(`${BASE_URL}${ApiEndpoints.processing.getProcessingData}`, {
      params: this.generateQueryParametersForProcesses(filter),
    });
  }

  createBottleBatch(data: FormData) {
    return this.httpClient.post<BottlingDto[]>(`${BASE_URL}${ApiEndpoints.processing.createBottleBatch}`, data);
  }

  private generateQueryParametersForProcesses(filter?: ProcessingFilter): HttpParams {
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
