/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { FormattedUnits } from '../../../shared/constants/formatted-units';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from '../../../shared/services/production/production.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { ProductionCsvUploadComponent } from './csv-upload/production-csv-upload.component';
import { ProductionFormComponent } from './manual-data-imput/production-form.component';

@Component({
  selector: 'app-add-production-data',
  providers: [provideNativeDateAdapter(), CompaniesService, ProductionService, PowerAccessApprovalService],
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    ProductionCsvUploadComponent,
    ProductionFormComponent,
  ],
  templateUrl: './add-production-data.component.html',
})
export class AddProductionDataComponent {
  useCSV = true;
  readonly FormattedUnits = FormattedUnits;

  approvalsQuery = injectQuery(() => ({
    queryKey: ['power-access-approvals'],
    queryFn: async () => {
      const approvals = await this.powerAccessApprovalsService.getApprovals(PowerAccessApprovalStatus.APPROVED);
      return [
        ...approvals.map((a) => ({
          value: a.powerProductionUnit,
          name: `${a.powerProducer.name} | ${a.powerProductionUnit.name}`,
        })),
      ];
    },
  }));

  hydrogenProductionQuery = injectQuery(() => ({
    queryKey: ['h2-production'],
    queryFn: async () => this.unitsService.getHydrogenProductionUnits(),
  }));

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: async () => this.unitsService.getHydrogenStorageUnits(),
  }));

  constructor(
    private readonly unitsService: UnitsService,
    private readonly powerAccessApprovalsService: PowerAccessApprovalService,
  ) {}
}
