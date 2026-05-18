/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, inject, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { BottlingOverviewDto } from '@h2-trust/contracts/dtos';
import { RfnboChipComponent } from '../../../layout/chips/rfnbo-chip.component';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { UnitsService } from '../../../shared/services/units/units.service';

@Component({
  selector: 'app-processing-overview',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSortModule,
    RouterModule,
    RfnboChipComponent,
  ],
  providers: [BottlingService],
  templateUrl: './bottling-overview.component.html',
  styles: `
    .mat-mdc-row:hover {
      background-color: #f2fafc;
      cursor: pointer;
    }
  `,
})
export class BottlingOverviewComponent implements AfterViewInit {
  displayedColumns = ['id', 'filledAt', 'owner', 'filledAmount', 'color'];
  dataSource: MatTableDataSource<BottlingOverviewDto> = new MatTableDataSource<BottlingOverviewDto>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  unitsService = inject<UnitsService>(UnitsService);
  processService = inject<BottlingService>(BottlingService);

  processingQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.BOTTLING],
    queryFn: async () => this.processService.getBottlings(),
  }));

  protected readonly bottlingTableEffect = effect(async () => {
    const data = await this.processService.getBottlings();
    this.dataSource.data = data;
  });

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
