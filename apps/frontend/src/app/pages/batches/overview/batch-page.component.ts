/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounce, form, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { BatchDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit, ProcessType } from '@h2-trust/domain';
import { BatchTypeChipComponent } from '../../../layout/chips/batch-type-chip.component';
import { RfnboChipComponent } from '../../../layout/chips/rfnbo-chip.component';
import { BatchFilterModel } from '../../../shared/model/batch-filter.model';
import { PaginationModel } from '../../../shared/model/pagination.model';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { BatchService } from '../../../shared/services/batch/batch.service';

@Component({
  selector: 'app-batch-page',
  imports: [
    CommonModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    FormField,
    MatPaginatorModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    FormField,
    RfnboChipComponent,
    UnitPipe,
    EnumPipe,
    MatButtonModule,
    BatchTypeChipComponent,
    RouterLink,
    MatTooltipModule,
  ],
  templateUrl: './batch-page.component.html',
})
export class BatchPageComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly availableBatchTypes = Object.values(ProcessType).filter(
    (type) => type !== ProcessType.WATER_CONSUMPTION,
  );

  batchService = inject(BatchService);

  displayedColumns = ['id', 'amount', 'createdAt', 'batchType', 'rfnboType', 'dpp'] as const;

  dataSource: MatTableDataSource<BatchDto> = new MatTableDataSource<BatchDto>();
  totalItems = 0;

  filterModel = signal<BatchFilterModel>({
    id: '',
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

  onPageChange(e: PageEvent) {
    this.paginationModel.set({ pageIndex: e.pageIndex, pageSize: e.pageSize });
  }
}
