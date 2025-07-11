import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BottlingDto, BottlingOverviewDto, ProductPassDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class BottlingService {
  constructor(private readonly httpClient: HttpClient) {}

  getBottlings() {
    return lastValueFrom(this.httpClient.get<BottlingOverviewDto[]>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}`));
  }

  createBottleBatch(data: FormData) {
    return lastValueFrom(this.httpClient.post<BottlingDto[]>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}`, data));
  }

  findBatchById(id: string) {
    return lastValueFrom(this.httpClient.get<ProductPassDto>(`${BASE_URL}${ApiEndpoints.BOTTLINGS}/${id}`));
  }
}
