/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatePipe } from '@angular/common';
import { Component, effect, inject, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { RfnboChipComponent } from '../../../../layout/chips/rfnbo-chip.component';
import { H2TrustRouterLinks } from '../../../../shared/constants/router-links';
import { ProcessStepActivity, ProcessStepOwnershipStatus } from '../../../../shared/model/process-step-activity.model';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { BatchService } from '../../../../shared/services/batch/batch.service';

interface ActivityFilter {
  status: ProcessStepOwnershipStatus | null;
  startDate: string | null;
  endDate: string | null;
}

@Component({
  selector: 'app-batch-activity',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    ReactiveFormsModule,
    DatePipe,
    RouterModule,
    UnitPipe,
    EnumPipe,
    RfnboChipComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './batch-activity.component.html',
})
export class BatchActivityComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly H2TrustRouterLinks = H2TrustRouterLinks;
  protected readonly ProcessStepOwnershipStatus = ProcessStepOwnershipStatus;

  private readonly batchService = inject(BatchService);

  protected readonly statusControl = new FormControl<ProcessStepOwnershipStatus | null>(null);
  protected readonly startDateControl = new FormControl<Date | null>(null);
  protected readonly endDateControl = new FormControl<Date | null>(null);

  protected readonly displayedColumns = ['createdAt', 'processType', 'amount', 'rfnboType', 'owner', 'status', 'dpp'];

  protected readonly dataSource = new MatTableDataSource<ProcessStepActivity>();

  protected readonly activityQuery = injectQuery(() => ({
    queryKey: ['process-step-activity'],
    queryFn: () => this.batchService.getActivity(),
  }));

  protected readonly activityEffect = effect(() => {
    this.dataSource.data = this.activityQuery.data() ?? [];
    this.applyFilters();
  });

  constructor() {
    this.dataSource.filterPredicate = (activity: ProcessStepActivity, serializedFilter: string): boolean => {
      const filter = JSON.parse(serializedFilter) as ActivityFilter;
      const activityDate = new Date(activity.createdAt);

      const matchesStatus = !filter.status || activity.ownershipStatus === filter.status;

      const matchesStartDate = !filter.startDate || activityDate >= new Date(filter.startDate);

      const matchesEndDate =
        !filter.endDate || activityDate <= new Date(new Date(filter.endDate).setHours(23, 59, 59, 999));

      return matchesStatus && matchesStartDate && matchesEndDate;
    };

    this.statusControl.valueChanges.subscribe(() => this.applyFilters());
    this.startDateControl.valueChanges.subscribe(() => this.applyFilters());
    this.endDateControl.valueChanges.subscribe(() => this.applyFilters());
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    if (!paginator) {
      return;
    }

    this.dataSource.paginator = paginator;
    this.applyFilters();
  }

  protected isOwned(activity: ProcessStepActivity): boolean {
    return activity.ownershipStatus === ProcessStepOwnershipStatus.OWNED;
  }

  protected clearFilters(): void {
    this.statusControl.reset();
    this.startDateControl.reset();
    this.endDateControl.reset();
  }

  private applyFilters(): void {
    const filter: ActivityFilter = {
      status: this.statusControl.value,
      startDate: this.startDateControl.value?.toISOString() ?? null,
      endDate: this.endDateControl.value?.toISOString() ?? null,
    };

    this.dataSource.filter = JSON.stringify(filter);
    this.dataSource.paginator?.firstPage();
  }
}
