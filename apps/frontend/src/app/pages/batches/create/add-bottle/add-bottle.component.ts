/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import {
  BottlingOverviewDto,
  HydrogenComponentDto,
  HydrogenStorageOverviewDto,
  UserDto,
} from '@h2-trust/contracts/dtos';
import { FuelType, MeasurementUnit, RfnboType, TransportMode, UnitType } from '@h2-trust/domain';
import { FileTypes } from '../../../../shared/constants/file-types';
import { H2TrustRoutes } from '../../../../shared/constants/routes';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { companiesQueryOptions } from '../../../../shared/queries/companies.query';
import { QueryKeyPrefix } from '../../../../shared/queries/shared-query-keys';
import { hydrogenStorageUnitsQueryOptions } from '../../../../shared/queries/units.query';
import { BottlingService } from '../../../../shared/services/bottling/bottling.service';
import { CompaniesService } from '../../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { handleMutationWithPromiseToast } from '../../../../shared/util/query-error-handler';
import { BottlingForm } from './form';

@Component({
  selector: 'app-add-bottle',
  providers: [provideNativeDateAdapter(), CompaniesService, BottlingService, EnumPipe],
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    RouterModule,
  ],
  templateUrl: './add-bottle.component.html',
})
export class AddBottleComponent {
  router = inject(Router);
  unitsService = inject(UnitsService);
  companiesService = inject(CompaniesService);
  processService = inject(BottlingService);
  enumPipe = inject(EnumPipe);
  private queryClient = inject(QueryClient);

  protected readonly FileTypes = FileTypes;
  protected readonly TransportType = TransportMode;
  protected readonly FuelType = FuelType;
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly RfnboType = RfnboType;
  protected readonly bottleTypes = [RfnboType.RFNBO_READY, RfnboType.NON_CERTIFIABLE] as const;

  dateDelimiter: Date = new Date();
  uploadedFiles: File[] = [];

  bottleFormGroup: FormGroup<BottlingForm> = new FormGroup({
    date: new FormControl<Date | undefined>(new Date(), Validators.required),
    time: new FormControl<Date | undefined>(new Date(), Validators.required),
    amount: new FormControl<number | undefined>(undefined, [Validators.required, Validators.min(1)]),
    recipient: new FormControl<UserDto | undefined>(undefined, Validators.required),
    storageUnit: new FormControl<HydrogenStorageOverviewDto | undefined>(undefined, Validators.required),
    type: new FormControl<'NON_CERTIFIABLE' | 'RFNBO_READY' | undefined>(undefined, Validators.required),
    transportMode: new FormControl<TransportMode | null>(null, Validators.required),
    fuelType: new FormControl<FuelType | null>(null),
    distance: new FormControl<number | null>(null),
  });

  hydrogenStorageQuery = injectQuery(() => hydrogenStorageUnitsQueryOptions(this.unitsService));

  recipientsQuery = injectQuery(() => companiesQueryOptions(this.companiesService));

  mutation = injectMutation(() => ({
    mutationFn: async (dto: FormData) => {
      await handleMutationWithPromiseToast<BottlingOverviewDto>(
        this.processService.createBottleBatch(dto),
        'Successfully created',
      );
      await this.queryClient.invalidateQueries({
        queryKey: [QueryKeyPrefix.UNITS, UnitType.HYDROGEN_STORAGE],
      });
      await this.queryClient.invalidateQueries({
        queryKey: [QueryKeyPrefix.BOTTLING],
      });
      this.router.navigateByUrl(H2TrustRoutes.BOTTLING);
    },
  }));

  constructor() {
    this.bottleFormGroup.controls.transportMode.valueChanges.subscribe((transportMode) =>
      this.onTransportModeChange(transportMode),
    );

    this.bottleFormGroup.controls.amount?.valueChanges.subscribe((amount) => this.onAmountChange(amount));
  }

  get bottleTypeControl() {
    return this.bottleFormGroup.controls.type as FormControl<RfnboType | undefined>;
  }

  removeFile(file: File): void {
    this.uploadedFiles = this.uploadedFiles.filter((uploadedFile: File) => uploadedFile !== file);
  }

  createBottleData() {
    const data = new FormData();

    if (this.uploadedFiles)
      for (const file of this.uploadedFiles) {
        data.append('files', file);
      }

    data.append('amount', this.bottleFormGroup.value?.amount?.toString() ?? '');
    data.append('recipient', this.bottleFormGroup.value.recipient?.id ?? '');
    data.append('filledAt', this.createTimestamp().toISOString());
    data.append('recordedBy', '');
    data.append('hydrogenStorageUnit', this.bottleFormGroup.value.storageUnit?.id ?? '');
    data.append('rfnboType', this.bottleFormGroup.value.type ?? '');
    data.append('transportMode', this.bottleFormGroup.value.transportMode ?? '');
    data.append('fuelType', this.bottleFormGroup.value.fuelType ?? '');
    data.append('distance', this.bottleFormGroup.value.distance?.toString() ?? '');

    this.mutation.mutate(data);
  }

  private createTimestamp() {
    const dateValue = this.bottleFormGroup.controls['date']?.value;
    const timeValue = this.bottleFormGroup.controls['time']?.value;

    if (!dateValue || !timeValue) {
      throw new Error('No Date and/or Time Found');
    }

    const pickedDate = new Date(dateValue);
    const pickedTimeAsDate = new Date(timeValue);

    pickedDate.setHours(pickedTimeAsDate.getHours());
    pickedDate.setMinutes(pickedTimeAsDate.getMinutes());

    return pickedDate;
  }

  private onTransportModeChange(transportMode: TransportMode | null) {
    if (!transportMode) return;

    const fuelTypeControl = this.bottleFormGroup.controls.fuelType;
    const distanceControl = this.bottleFormGroup.controls.distance;

    if (transportMode === TransportMode.TRAILER) {
      fuelTypeControl.addValidators(Validators.required);
      distanceControl.addValidators([Validators.required, Validators.min(1)]);
    } else {
      fuelTypeControl.removeValidators(Validators.required);
      fuelTypeControl.setValue(null);
      distanceControl.removeValidators([Validators.required, Validators.min(1)]);
      distanceControl.setValue(null);
    }

    fuelTypeControl.updateValueAndValidity();
    distanceControl.updateValueAndValidity();
  }

  private onAmountChange(amount: number | null | undefined) {
    if (!amount) return;

    this.bottleFormGroup.controls.type.reset();

    if (this.bottleFormGroup.value?.storageUnit && amount > this.bottleFormGroup.value?.storageUnit?.filling)
      this.bottleFormGroup.controls.storageUnit?.reset();
  }

  displayComposition(hydrogenComposition: HydrogenComponentDto[]) {
    const sum = hydrogenComposition.reduce((a, b) => a + b.amount, 0);
    return hydrogenComposition.map(
      (c) => ` ${this.enumPipe.transform(c.rfnboType, 'rfnboType')} (${((c.amount * 100) / sum).toFixed(2)} %)`,
    );
  }

  isAmountAvailable(requestedAmount: number | null, hydrogenComposition: HydrogenComponentDto[]) {
    if (!requestedAmount) return false;
    const rfnboAmount = this.getAvailableGreenAmount(hydrogenComposition);
    return requestedAmount <= rfnboAmount;
  }

  rfnboDisabledTypes(hydrogenComposition: HydrogenComponentDto[]) {
    const amount = this.bottleFormGroup.value.amount;
    if (this.isAmountAvailable(amount ?? null, hydrogenComposition)) {
      return [];
    }

    return [RfnboType.RFNBO_READY];
  }

  rfnboDescriptions(hydrogenComposition: HydrogenComponentDto[]) {
    return {
      [RfnboType.RFNBO_READY]: `The bottling will contain RFNBO ready hydrogen only. Available amount: ${this.getAvailableGreenAmount(
        hydrogenComposition,
      ).toFixed(2)} kg`,
      [RfnboType.NON_CERTIFIABLE]: `The composition of the filling will correspond to the hydrogen composition of the selected storage unit: ${this.displayComposition(
        hydrogenComposition,
      )}.`,
    };
  }

  getAvailableGreenAmount(hydrogenComposition: HydrogenComponentDto[]) {
    return hydrogenComposition.find((item) => item.rfnboType == RfnboType.RFNBO_READY)?.amount ?? 0;
  }
}
