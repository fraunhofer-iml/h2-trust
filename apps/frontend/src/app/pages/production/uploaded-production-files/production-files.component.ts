/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from 'ngx-sonner';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, computed, effect, inject, signal, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
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
import { CsvContentType, DownloadFilesDto, ProcessedCsvDto } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';
import { H2ColorChipComponent } from '../../../layout/h2-color-chip/h2-color-chip.component';
import { ICONS } from '../../../shared/constants/icons';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { ProductionService } from '../../../shared/services/production/production.service';

@Component({
  selector: 'app-production-files',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatLabel,
    MatSelectModule,
    UnitPipe,
    MatSortModule,
    H2ColorChipComponent,
    MatCheckboxModule,
    MatBadgeModule,
  ],
  providers: [ProductionService, provideNativeDateAdapter()],
  templateUrl: './production-files.component.html',
})
export class ProductionFilesComponent implements AfterViewInit {
  protected readonly ICONS = ICONS.UNITS;
  protected readonly MeasurementUnit = MeasurementUnit;
  readonly displayedColumns = ['select', 'name', 'uploadedBy', 'startedAt', 'endedAt', 'type', 'amount'] as const;
  readonly displayedCsvContentTypes: { name: string; value: CsvContentType | null }[] = [
    { name: 'Hydrogen', value: 'HYDROGEN' },
    { name: 'Power', value: 'POWER' },
    { name: 'All', value: null },
  ] as const;

  productionService = inject(ProductionService);

  selecteType$ = signal<CsvContentType | null>(null);
  startDate$ = signal<Date | null>(null);
  endDate$ = signal<Date | null>(null);
  searchValue$ = signal<string>('');

  dataSource: MatTableDataSource<ProcessedCsvDto> = new MatTableDataSource<ProcessedCsvDto>();
  searchControl = new FormControl<string>('');
  selection = new SelectionModel<ProcessedCsvDto>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  upoadsQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      return await this.productionService.getUploadedCsvFiles();
    },
  }));

  datasource$ = computed(() => {
    let data = this.upoadsQuery.data() ?? [];

    const typeToShow = this.selecteType$();
    const start = this.startDate$();
    const end = this.endDate$();
    const search = this.searchValue$();

    if (typeToShow) data = data.filter((item) => item.csvContentType === typeToShow);

    if (start && end)
      data = data.filter((item) => {
        const itemStart = new Date(item.startedAt);
        const itemEnd = new Date(item.endedAt);
        return itemStart <= end && itemEnd >= start;
      });

    if (search)
      data = data.filter(
        (item) => item.name.toLowerCase().includes(search) || item.uploadedBy.toLowerCase().includes(search),
      );

    return data;
  });

  constructor() {
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.searchValue$.set((value ?? '').toLowerCase());
    });

    effect(() => {
      this.dataSource.data = this.datasource$();
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  clearFilters() {
    this.searchControl.patchValue(null);
    this.startDate$.set(null);
    this.endDate$.set(null);
    this.selecteType$.set(null);
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

  async downloadSelected() {
    const files = this.selection.selected;

    if (!files || files.length === 0) return;

    if (files.length === 1) {
      const { url, name } = files[0];
      this.saveFile(url, name);
    } else {
      const dto: DownloadFilesDto = { ids: files.map((f) => f.name) };
      this.fetchFiles(dto);
    }
  }

  private async fetchFiles(dto: DownloadFilesDto) {
    const downloadPromise: Promise<Blob> = this.productionService.downloadFiles(dto);
    toast.promise(downloadPromise, {
      loading: 'Fetching Files...',
      error: (error): string => {
        if (error instanceof HttpErrorResponse) {
          return `Failed to fetch files: ${error.statusText}`;
        }
        return 'Failed to fetch files';
      },
    });
    const download: Blob = await downloadPromise;

    const blobUrl = URL.createObjectURL(download);
    this.saveFile(blobUrl, 'download.zip');
    URL.revokeObjectURL(blobUrl);
  }

  private saveFile(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
