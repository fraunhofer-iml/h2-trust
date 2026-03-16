/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DateTime } from 'luxon';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { debounce, form, FormField } from '@angular/forms/signals';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProductionOverviewDto } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';
import { PowerTypeChipComponent } from '../../../layout/chips/power-type-chip.component';
import { RfnboChipComponent } from '../../../layout/chips/rfnbo-chip.component';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { ProductionService } from '../../../shared/services/production/production.service';
import { FilterModel } from '../model/generated-productions-filter.model';
import { PaginationModel } from '../model/pagination.model';
import { ProductionStatisticsComponent } from '../statistics/production-statistics.component';

export const DATE_FORMATS = {
  parse: {
    dateInput: 'MM/yyyy',
  },
  display: {
    dateInput: 'MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'DD',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: 'app-production-view',
  imports: [
    MatPaginatorModule,
    MatTableModule,
    DatePipe,
    TitleCasePipe,
    MatButtonModule,
    MatSortModule,
    ProductionStatisticsComponent,
    MatInputModule,
    FormField,
    MatDatepickerModule,
    RfnboChipComponent,
    PowerTypeChipComponent,
    UnitPipe,
  ],
  providers: [ProductionService, MatFormFieldModule, ReactiveFormsModule, provideLuxonDateAdapter(DATE_FORMATS)],
  templateUrl: './production-view.component.html',
})
export class ProductionViewComponent implements AfterViewInit {
  displayedColumns = [
    'producedAt',
    'powerProducer',
    'powerConsumed',
    'powerType',
    'productionUnit',
    'producedAmount',
    'rfnboType',
    'storageUnit',
  ];
  protected readonly MeasurementUnit = MeasurementUnit;
  dataSource: MatTableDataSource<ProductionOverviewDto> = new MatTableDataSource<ProductionOverviewDto>();
  totalItems = 0;

  @ViewChild(MatSort) sort!: MatSort;

  productionService = inject(ProductionService);
  filterModel = signal<FilterModel>({
    unit: '',
    month: new Date(),
  });

  pagination = signal<PaginationModel>({
    pageIndex: 0,
    pageSize: 5,
  });

  filterForm = form(this.filterModel, (schemaPath) => {
    debounce(schemaPath.unit, 500);
  });
  productionQuery = injectQuery(() => ({
    queryKey: ['production', this.filterModel(), this.pagination()],
    queryFn: async () => {
      const paginatedData = await this.productionService.getProductions(this.filterModel(), this.pagination());
      console.log(paginatedData);
      this.dataSource.data = paginatedData.data;
      this.totalItems = paginatedData.totalItems;
      return paginatedData;
    },
  }));

  maxDate = new Date();

  setMonthAndYear(normalizedMonthAndYear: DateTime, datepicker: MatDatepicker<DateTime>) {
    const ctrlValue = DateTime.fromObject({
      month: normalizedMonthAndYear.month,
      year: normalizedMonthAndYear.year,
    }).toISO();

    if (!ctrlValue) {
      return;
    }

    this.filterModel.update((form) => ({
      ...form,
      month: new Date(ctrlValue),
    }));
    datepicker.close();
  }

  ngAfterViewInit() {
    this.dataSource.sortingDataAccessor = (data: ProductionOverviewDto, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'startedAt':
          return new Date(data.startedAt).getTime();
        default:
          return data[sortHeaderId as keyof ProductionOverviewDto];
      }
    };
    this.dataSource.sort = this.sort;
  }

  onPageChange(e: PageEvent) {
    this.pagination.set({ pageIndex: e.pageIndex, pageSize: e.pageSize });
  }
}
