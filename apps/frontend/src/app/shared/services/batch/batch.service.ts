import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { BatchDto, PaginatedDataDto } from '@h2-trust/contracts/dtos';
import { API } from '../../constants/api-endpoints';
import { BatchFilterModel } from '../../model/batch-filter.model';
import { PaginationModel } from '../../model/pagination.model';

@Injectable({
  providedIn: 'root',
})
export class BatchService {
  private readonly httpClient = inject(HttpClient);

  getBatches({ batchType, id }: BatchFilterModel, { pageIndex, pageSize }: PaginationModel) {
    let params = new HttpParams();
    if (batchType) params = params.set('batchType', batchType);
    if (id) params = params.set('id', id);

    params = params.set('pageNumber', pageIndex + 1);
    params = params.set('pageSize', pageSize);

    return lastValueFrom(this.httpClient.get<PaginatedDataDto<BatchDto>>(API.BATCHES.BASE, { params }));
  }
}
