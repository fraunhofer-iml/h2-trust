/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCardComponent } from 'apps/frontend/src/app/layout/error-card/error-card.component';
import { ERROR_MESSAGES } from 'apps/frontend/src/app/shared/constants/error.messages';
import { FormattedUnits } from 'apps/frontend/src/app/shared/constants/formatted-units';
import { ROUTES } from 'apps/frontend/src/app/shared/constants/routes';
import { ProductionService } from 'apps/frontend/src/app/shared/services/production/production.service';
import { toast } from 'ngx-sonner';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Router } from '@angular/router';
import { injectMutation } from '@tanstack/angular-query-experimental';
import {
  CreateProductionDto,
  HydrogenProductionOverviewDto,
  HydrogenStorageOverviewDto,
  PowerProductionOverviewDto,
} from '@h2-trust/api';
import { TimeInSeconds } from '@h2-trust/domain';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-production-form',
  imports: [
    CommonModule,
    MatSelectModule,
    ErrorCardComponent,
    MatDatepickerModule,
    MatTimepickerModule,
    FormsModule,
    ReactiveFormsModule,
    UnitPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './production-form.component.html',
})
export class ProductionFormComponent {
  private readonly productionService: ProductionService = inject(ProductionService);
  private readonly router: Router = inject(Router);

  private readonly accountingPeriodInMinutes: number = TimeInSeconds.ACCOUNTING_PERIOD / 60;

  powerAccessApprovals = input<{ value: PowerProductionOverviewDto; name: string }[]>([]);
  hydrogenProductionUnits = input<HydrogenProductionOverviewDto[]>([]);
  hydrogenStorageUnits = input<HydrogenStorageOverviewDto[]>([]);

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
      this.router.navigateByUrl(ROUTES.PRODUCTION);
    },
  }));

  today = new Date();
  isTimePeriodInvalid = false;
  ERROR_MESSAGES = ERROR_MESSAGES;
  readonly FormattedUnits = FormattedUnits;

  constructor() {
    const minutes = new Date().getMinutes();
    this.form.controls.productionEndedAt.value?.setMinutes(
      minutes + this.accountingPeriodInMinutes - (minutes % this.accountingPeriodInMinutes),
      0,
      0,
    );
    this.form.controls.productionStartedAt.value?.setMinutes(
      minutes - (minutes % this.accountingPeriodInMinutes),
      0,
      0,
    );
  }

  submit() {
    const dto: CreateProductionDto = {
      productionStartedAt: this.form.value.productionStartedAt ?? new Date(),
      productionEndedAt: this.form.value.productionEndedAt ?? new Date(),
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
