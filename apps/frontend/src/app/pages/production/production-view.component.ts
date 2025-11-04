/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProductionOverviewDto } from '@h2-trust/api';
import { H2ColorChipComponent } from '../../layout/h2-color-chip/h2-color-chip.component';
import { ProductionService } from '../../shared/services/production/production.service';

@Component({
  selector: 'app-production-view',
  imports: [
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    DatePipe,
    DecimalPipe,
    TitleCasePipe,
    MatButtonModule,
    MatSortModule,
    H2ColorChipComponent,
    RouterModule,
  ],
  providers: [ProductionService],
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
  dialog = inject(MatDialog);

  productionQuery = injectQuery(() => ({
    queryKey: ['production'],
    queryFn: async () => {
      const data = await this.productionService.getProductions();
      this.dataSource.data = data;
      return data;
    },
  }));

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
