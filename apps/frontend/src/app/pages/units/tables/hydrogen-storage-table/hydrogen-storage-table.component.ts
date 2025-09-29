/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, input, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { HydrogenStorageOverviewDto } from '@h2-trust/api';
import { AuthService } from '../../../../shared/services/auth/auth.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UsersService } from '../../../../shared/services/users/users.service';

@Component({
  selector: 'app-hydrogen-storage-table',
  providers: [AuthService, UnitsService, UsersService],
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatPaginatorModule,
    MatSortModule,
    RouterModule,
  ],
  templateUrl: './hydrogen-storage-table.component.html',
})
export class HydrogenStorageTableComponent implements AfterViewInit {
  displayedColumns = ['name', 'fillingLevel', 'fillingStatus', 'productionUnit'];
  data = input<HydrogenStorageOverviewDto[]>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource$ = computed(() => {
    const source = new MatTableDataSource<HydrogenStorageOverviewDto>(this.data());
    source.paginator = this.paginator;
    source.sort = this.sort;
    return source;
  });

  ngAfterViewInit() {
    this.dataSource$().paginator = this.paginator;
    this.dataSource$().sort = this.sort;
  }
}
