import { lastValueFrom } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BottlingDto, ProcessingOverviewDto, ProcessType } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class ProcessingService {
  constructor(private readonly httpClient: HttpClient) {}

  getProcessingDataOfCompany() {
    let params = new HttpParams();
    params = params.append('processType', ProcessType.BOTTLING);

    return lastValueFrom(
      this.httpClient.get<ProcessingOverviewDto[]>(`${BASE_URL}${ApiEndpoints.processes.getProcesses}`, {
        params: params,
      }),
    );
  }

  createBottleBatch(data: FormData) {
    return lastValueFrom(
      this.httpClient.post<BottlingDto[]>(`${BASE_URL}${ApiEndpoints.processes.getProcesses}`, data),
    );
  }
}
