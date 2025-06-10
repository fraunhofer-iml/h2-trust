import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CompanyDto } from '@h2-trust/api';
import { BASE_URL } from '../../../../environments/environment';
import { ApiEndpoints } from '../../constants/api-endpoints';

@Injectable()
export class CompaniesService {
  constructor(private readonly httpClient: HttpClient) {}

  getRecipients() {
    return lastValueFrom(this.httpClient.get<CompanyDto[]>(`${BASE_URL}${ApiEndpoints.companies.getCompanies}`));
  }
}
