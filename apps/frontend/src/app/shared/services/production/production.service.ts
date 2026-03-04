/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccountingPeriodMatchingResultDto,
  CreateProductionDto,
  CsvDocumentIntegrityResultDto,
  DownloadFilesDto,
  ImportSubmissionDto,
  ProcessedCsvDto,
  ProductionOverviewDto,
  ProductionStatisticsDto,
} from '@h2-trust/api';
import { API } from '../../constants/api-endpoints';

@Injectable()
export class ProductionService {
  constructor(private readonly httpClient: HttpClient) {}

  getProductions() {
    return lastValueFrom(this.httpClient.get<ProductionOverviewDto[]>(API.PRODUCTION.BASE));
  }

  getStatistics() {
    return lastValueFrom(this.httpClient.get<ProductionStatisticsDto>(API.PRODUCTION.STATISTICS));
  }

  getUploadedCsvFiles() {
    return lastValueFrom(this.httpClient.get<ProcessedCsvDto[]>(API.PRODUCTION.CSV));
  }

  addProductionData(dto: CreateProductionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(API.PRODUCTION.BASE, dto));
  }

  uploadCsv(data: FormData) {
    return lastValueFrom(this.httpClient.post<AccountingPeriodMatchingResultDto>(API.PRODUCTION.CSV_IMPORT, data));
  }

  submitCsv(dto: ImportSubmissionDto) {
    return lastValueFrom(this.httpClient.post<ProductionOverviewDto[]>(API.PRODUCTION.CSV_SUBMIT, dto));
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
