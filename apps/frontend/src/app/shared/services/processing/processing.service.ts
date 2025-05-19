import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BottlingDto, ProcessingOverviewDto, ProcessType } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProcessingService {
  constructor(private readonly httpClient: HttpClient) {}

  getProcessingDataOfCompany(companyId: string) {
    return this.httpClient.get<ProcessingOverviewDto[]>(`${BASE_URL}${ApiEndpoints.processes.getProcesses}`, {
      params: this.generateQueryParametersForProcesses(companyId),
    });
  }

  createBottleBatch(data: FormData) {
    return this.httpClient.post<BottlingDto[]>(`${BASE_URL}${ApiEndpoints.processes.getProcesses}`, data);
  }

  private generateQueryParametersForProcesses(companyId: string): HttpParams {
    let params = new HttpParams();

    params = params.append('companyId', companyId);
    params = params.append('processType', ProcessType.BOTTLING);

    return params;
  }
}
