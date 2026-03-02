/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { debounce, form, FormField } from '@angular/forms/signals';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CsvContentType, ProcessedCsvDto } from '@h2-trust/api';
import { BatchType, CsvDocumentIntegrityStatus, MeasurementUnit } from '@h2-trust/domain';
import { ICONS } from '../../../shared/constants/icons';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { ProductionService } from '../../../shared/services/production/production.service';
import { VerificationResultStore } from '../../../shared/services/verification-state/verification-result.service';
import { DownloadButtonComponent } from './download-button/download-button.component';
import { VerifyComponent } from './verification/verify.component';

interface FilterModel {
  input: string;
  fileType: CsvContentType | null;
  start: Date | null;
  end: Date | null;
}

@Component({
  selector: 'app-production-files',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatLabel,
    MatSelectModule,
    UnitPipe,
    MatSortModule,
    MatCheckboxModule,
    DownloadButtonComponent,
    FormField,
    MatTooltip,
    MatBottomSheetModule,
    VerifyComponent,
    RouterModule,
  ],
  providers: [ProductionService, provideNativeDateAdapter()],
  templateUrl: './production-files.component.html',
})
export class ProductionFilesComponent implements AfterViewInit {
  protected readonly ICONS = ICONS.UNITS;
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly CsvContentType = BatchType;
  protected readonly CsvDocumentIntegrityStatus = CsvDocumentIntegrityStatus;
  readonly displayedColumns = [
    'select',
    'name',
    'uploadedBy',
    'startedAt',
    'endedAt',
    'type',
    'amount',
    'validationStatus',
    'button',
  ] as const;

  readonly displayedCsvContentTypes: { name: string; value: CsvContentType | null }[] = [
    { name: 'Hydrogen', value: BatchType.HYDROGEN },
    { name: 'Power', value: BatchType.POWER },
    { name: 'All', value: null },
  ] as const;

  productionService = inject(ProductionService);
  resultStore = inject(VerificationResultStore);

  searchModel = signal<FilterModel>({
    input: '',
    fileType: null,
    start: null,
    end: null,
  });

  searchForm = form(this.searchModel, (schemaPath) => {
    debounce(schemaPath.input, 500);
  });

  dataSource: MatTableDataSource<ProcessedCsvDto> = new MatTableDataSource<ProcessedCsvDto>();
  selection = new SelectionModel<ProcessedCsvDto>(true, []);

  getIcon(status: CsvDocumentIntegrityStatus | undefined) {
    switch (status) {
      case CsvDocumentIntegrityStatus.MISMATCH:
        return 'cancel';
      case CsvDocumentIntegrityStatus.FAILED:
        return 'warning';
      case CsvDocumentIntegrityStatus.VERIFIED:
        return 'check_circle';
      default:
        return 'circle';
    }
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  uploadsQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async (): Promise<ProcessedCsvDto[]> => {
      const data = await this.productionService.getUploadedCsvFiles();
      return data;
    },
  }));

  datasource$ = computed(() => {
    let data = this.uploadsQuery.data() ?? [];

    const { input, start, end, fileType: type } = this.searchForm().value();

    if (type) {
      data = data.filter((item) => item.csvContentType === type);
    }

    if (start && end) {
      data = data.filter((item) => {
        const itemStart = new Date(item.startedAt);
        const itemEnd = new Date(item.endedAt);
        return itemStart <= end && itemEnd >= start;
      });
    }

    if (input) {
      const val = input.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(val) ||
          item.uploadedBy.toLowerCase().includes(val) ||
          item.id.toLowerCase().includes(val),
      );
    }

    return data;
  });

  constructor() {
    effect(() => {
      this.dataSource.data = this.datasource$();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  clearFilters() {
    this.searchModel.set({ input: '', start: null, end: null, fileType: null });
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  getStatus(id: string) {
    return this.resultStore.getItem(id)?.status;
  }
}
