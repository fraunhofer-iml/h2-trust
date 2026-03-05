/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DateTime } from 'luxon';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject, signal, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { debounce, form, FormField } from '@angular/forms/signals';
import { provideLuxonDateAdapter } from '@angular/material-luxon-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProductionOverviewDto } from '@h2-trust/api';
import { H2ColorChipComponent } from '../../../layout/color-chip/h2-color-chip.component';
import { ProductionService } from '../../../shared/services/production/production.service';
import { FilterModel } from '../model/generated-productions-filter.model';
import { ProductionStatisticsComponent } from '../statistics/production-statistics.component';

export const H2_TRUST_FORMATS = {
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
    DecimalPipe,
    TitleCasePipe,
    MatButtonModule,
    MatSortModule,
    H2ColorChipComponent,
    ProductionStatisticsComponent,
    MatInputModule,
    FormField,
    MatDatepickerModule,
  ],
  providers: [ProductionService, MatFormFieldModule, ReactiveFormsModule, provideLuxonDateAdapter(H2_TRUST_FORMATS)],
  templateUrl: './production-view.component.html',
})
export class ProductionViewComponent implements AfterViewInit {
  displayedColumns = [
    'startedOn',
    'endedOn',
    'productionUnit',
    'producedAmount',
    'color',
    'powerProducer',
    'powerConsumed',
    'storageUnit',
  ];
  dataSource: MatTableDataSource<ProductionOverviewDto> = new MatTableDataSource<ProductionOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  productionService = inject(ProductionService);

  productionQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      const data = await this.productionService.getProductions();
      this.dataSource.data = data;
      return data;
    },
  }));

  filterModel = signal<FilterModel>({
    unit: '',
    month: new Date(),
  });

  filterForm = form(this.filterModel, (schemaPath) => {
    debounce(schemaPath.unit, 500);
  });

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
    this.dataSource.paginator = this.paginator;
    this.dataSource.sortingDataAccessor = (data: ProductionOverviewDto, sortHeaderId: string) => {
      switch (sortHeaderId) {
        case 'startedAt':
          return new Date(data.startedAt).getTime();
        case 'endedAt':
          return new Date(data.endedAt).getTime();
        default:
          return data[sortHeaderId as keyof ProductionOverviewDto];
      }
    };
    this.dataSource.sort = this.sort;
  }
}
