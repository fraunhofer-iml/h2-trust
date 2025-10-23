/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import {
  CreateProductionDto,
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  PowerProductionOverviewDto,
} from '@h2-trust/api';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { ERROR_MESSAGES } from '../../../shared/constants/error.messages';
import { FormattedUnits } from '../../../shared/constants/formatted-units';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { ProductionService } from '../../../shared/services/production/production.service';
import { UnitsService } from '../../../shared/services/units/units.service';

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
    ErrorCardComponent,
    UnitPipe,
  ],
  templateUrl: './add-production-data.component.html',
})
export class AddProductionDataComponent {
  readonly FormattedUnits = FormattedUnits;

  form = new FormGroup<{
    productionStartedAt: FormControl<Date | null>;
    productionEndedAt: FormControl<Date | null>;
    powerProductionUnit: FormControl<PowerProductionOverviewDto | null>;
    powerAmountKwh: FormControl<number | null>;
    hydrogenProductionUnit: FormControl<HydrogenProductionOverviewDto | null>;
    hydrogenStorageUnit: FormControl<HydrogenStorageOverviewDto | null>;
    hydrogenAmountKg: FormControl<number | null>;
  }>({
    productionStartedAt: new FormControl<Date | null>(new Date(), Validators.required),
    productionEndedAt: new FormControl<Date | null>(new Date(), Validators.required),
    powerProductionUnit: new FormControl<PowerProductionOverviewDto | null>(null, Validators.required),
    powerAmountKwh: new FormControl<number | null>(null, Validators.required),
    hydrogenProductionUnit: new FormControl<HydrogenProductionOverviewDto | null>(null, Validators.required),
    hydrogenStorageUnit: new FormControl<HydrogenStorageOverviewDto | null>(null, Validators.required),
    hydrogenAmountKg: new FormControl<number | null>(null, Validators.required),
  });

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

  mutation = injectMutation(() => ({
    mutationFn: (dto: CreateProductionDto) => {
      const result = this.productionService.addProductionData(dto);
      toast.promise(result, {
        loading: 'Loading...',
        success: 'Production data was added!',
      });
      return result;
    },

    onSuccess: () => {
      this.dialogRef.close(true);
    },
  }));

  today = new Date();
  isTimePeriodInvalid = false;
  ERROR_MESSAGES = ERROR_MESSAGES;

  constructor(
    public dialogRef: MatDialogRef<AddProductionDataComponent>,
    private readonly unitsService: UnitsService,
    private readonly powerAccessApprovalsService: PowerAccessApprovalService,
    private readonly productionService: ProductionService,
  ) {
    const minutes = new Date().getMinutes();
    this.form.controls.productionEndedAt.value?.setMinutes(minutes + 15 - (minutes % 15), 0, 0);
    this.form.controls.productionStartedAt.value?.setMinutes(minutes - (minutes % 15), 0, 0);
  }

  submit() {
    const dto: CreateProductionDto = {
      productionStartedAt: this.form.value.productionStartedAt?.toISOString() ?? new Date().toISOString(),
      productionEndedAt: this.form.value.productionEndedAt?.toISOString() ?? new Date().toISOString(),
      hydrogenProductionUnitId: this.form.value.hydrogenProductionUnit?.id ?? '',
      powerProductionUnitId: this.form.value.powerProductionUnit?.id ?? '',
      hydrogenAmountKg: this.form.value.hydrogenAmountKg ?? 0,
      powerAmountKwh: this.form.value.powerAmountKwh ?? 0,
      hydrogenStorageUnitId: this.form.value.hydrogenStorageUnit?.id ?? '',
    };
    this.mutation.mutate(dto);
  }

  private validateDate() {
    const end = this.form.controls.productionEndedAt.value;
    const start = this.form.controls.productionStartedAt.value;
    if (start && end) this.isTimePeriodInvalid = end <= start;
  }

  updateDate(val: Date, formControl: FormControl<Date | null>) {
    const current = formControl.value ?? new Date();
    const updated = new Date(val);
    updated.setHours(current.getHours(), current.getMinutes());
    formControl.patchValue(updated);
    this.validateDate();
  }

  updateTime(event: Date, formControl: FormControl<Date | null>) {
    formControl.patchValue(event);
    this.validateDate();
  }

  amountNotAvailable(): boolean {
    return (
      !!this.form.value.hydrogenAmountKg &&
      !!this.form.value.hydrogenStorageUnit &&
      this.form.value.hydrogenAmountKg >
        this.form.value.hydrogenStorageUnit.capacity - this.form.value.hydrogenStorageUnit.filling
    );
  }
}
