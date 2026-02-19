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
import { injectQuery } from '@tanstack/angular-query-experimental';
import { CsvContentType, ProcessedCsvDto } from '@h2-trust/api';
import { BatchType, MeasurementUnit } from '@h2-trust/domain';
import { FileTypeChipComponent } from '../../../layout/color-chip/file-type-chip.component';
import { ICONS } from '../../../shared/constants/icons';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { ProductionService } from '../../../shared/services/production/production.service';
import { DownloadButtonComponent } from './download-button/download-button.component';

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
    FileTypeChipComponent,
    FormField,
  ],
  providers: [ProductionService, provideNativeDateAdapter()],
  templateUrl: './production-files.component.html',
})
export class ProductionFilesComponent implements AfterViewInit {
  protected readonly ICONS = ICONS.UNITS;
  protected readonly MeasurementUnit = MeasurementUnit;
  readonly displayedColumns = ['select', 'name', 'uploadedBy', 'startedAt', 'endedAt', 'type', 'amount'] as const;
  readonly displayedCsvContentTypes: { name: string; value: CsvContentType | null }[] = [
    { name: 'Hydrogen', value: BatchType.HYDROGEN },
    { name: 'Power', value: BatchType.POWER },
    { name: 'All', value: null },
  ] as const;

  productionService = inject(ProductionService);

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

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  uploadsQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => await this.productionService.getUploadedCsvFiles(),
  }));

  datasource$ = computed(() => {
    let data = this.uploadsQuery.data() ?? [];

    const { input, start, end, fileType: type } = this.searchForm().value();

    if (type) data = data.filter((item) => item.csvContentType === type);

    if (start && end)
      data = data.filter((item) => {
        const itemStart = new Date(item.startedAt);
        const itemEnd = new Date(item.endedAt);
        return itemStart <= end && itemEnd >= start;
      });

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
}
