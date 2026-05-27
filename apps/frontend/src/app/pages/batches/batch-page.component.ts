import { Component, effect, inject, signal } from '@angular/core';
import { debounce, form } from '@angular/forms/signals';
import { MatTableDataSource } from '@angular/material/table';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { BatchDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit } from '@h2-trust/domain';
import { BatchFilterModel } from '../../shared/model/batch-filter.model';
import { PaginationModel } from '../../shared/model/pagination.model';
import { QueryKeyPrefix } from '../../shared/queries/shared-query-keys';
import { BatchService } from '../../shared/services/batch/batch.service';

@Component({
  selector: 'app-batch-page',
  imports: [],
  templateUrl: './batch-page.component.html',
})
export class BatchPageComponent {
  protected readonly MeasurementUnit = MeasurementUnit;

  batchService = inject(BatchService);

  displayedColumns = ['id', 'amount', 'createdAt', 'batchType', 'rfnboType'] as const;

  dataSource: MatTableDataSource<BatchDto> = new MatTableDataSource<BatchDto>();
  totalItems = 0;

  filterModel = signal<BatchFilterModel>({
    id: null,
    batchType: null,
  });

  paginationModel = signal<PaginationModel>({
    pageIndex: 0,
    pageSize: 5,
  });

  filterForm = form(this.filterModel, (schemaPath) => {
    debounce(schemaPath.id, 500);
  });

  batchQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.BATCHES, this.filterModel(), this.paginationModel()],
    queryFn: () => this.batchService.getBatches(this.filterModel(), this.paginationModel()),
  }));

  protected readonly tableEffect = effect(() => {
    const paginatedData = this.batchQuery.data();

    if (!paginatedData) return;

    this.dataSource.data = paginatedData.data;
    this.totalItems = paginatedData.totalItems;
  });
}
