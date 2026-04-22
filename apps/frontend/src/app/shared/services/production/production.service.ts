/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import {
  AccountingPeriodMatchingResultDto,
  CsvDocumentIntegrityResultDto,
  DownloadFilesDto,
  PaginatedProductionDataDto,
  ProcessedCsvDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
  StagedProductionDto,
  StagingSubmissionDto,
} from '@h2-trust/contracts/dtos';
import { CsvContentType, StagingScope } from '@h2-trust/domain';
import { FilterModel } from '../../../pages/production/model/generated-productions-filter.model';
import { PaginationModel } from '../../../pages/production/model/pagination.model';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class ProductionService {
  private readonly httpClient = inject(HttpClient);

  getProductions({ month, unit }: FilterModel, { pageIndex, pageSize }: PaginationModel) {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toISOString());
    params = params.set('unitName', unit);
    params = params.set('pageNumber', pageIndex + 1);
    params = params.set('pageSize', pageSize);

    return lastValueFrom(this.httpClient.get<PaginatedProductionDataDto>(API.PRODUCTION.BASE, { params }));
  }

  getStatistics({ month, unit }: FilterModel) {
    let params = new HttpParams();
    if (month) params = params.set('month', month.toISOString());
    params = params.set('unitName', unit);

    return lastValueFrom(this.httpClient.get<ProductionStatisticsDto>(API.PRODUCTION.STATISTICS, { params }));
  }

  getUploadedCsvFiles() {
    return lastValueFrom(this.httpClient.get<ProcessedCsvDto[]>(API.PRODUCTION.CSV));
  }

  getStagedProductions(type?: CsvContentType, scope?: StagingScope, from?: Date | string, to?: Date | string) {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (scope) params = params.set('scope', scope);

    if (from) {
      params = params.set('from', from instanceof Date ? from.toISOString() : from);
    }
    if (to) {
      params = params.set('to', to instanceof Date ? to.toISOString() : to);
    }

    return lastValueFrom(this.httpClient.get<StagedProductionDto[]>(API.PRODUCTION.PENDING, { params }));
  }

  uploadCsv(data: FormData) {
    return lastValueFrom(this.httpClient.post<AccountingPeriodMatchingResultDto>(API.PRODUCTION.CSV, data));
  }

  submitCsv(dto: StagingSubmissionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(API.PRODUCTION.BASE, dto));
  }

  downloadFiles(dto: DownloadFilesDto) {
    return lastValueFrom(
      this.httpClient.post(API.FILE_DOWNLOAD.BASE, dto, {
        responseType: 'blob',
      }),
    );
  }

  async validateFile(id: string): Promise<CsvDocumentIntegrityResultDto> {
    return firstValueFrom(this.httpClient.get<CsvDocumentIntegrityResultDto>(API.PRODUCTION.CSV_VERIFY(id)));
  }
}
