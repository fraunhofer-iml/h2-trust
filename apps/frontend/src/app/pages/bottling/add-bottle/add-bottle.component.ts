/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from 'ngx-sonner';
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
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { HydrogenComponentDto, HydrogenStorageOverviewDto, UserDto } from '@h2-trust/api';
import { FuelType, TransportMode } from '@h2-trust/domain';
import { FileDragAndDropComponent } from '../../../layout/drag-and-drop/file-drag-and-drop.component';
import { FileCardComponent } from '../../../layout/file-card/file-card.component';
import { FileTypes } from '../../../shared/constants/file-types';
import { FormattedUnits } from '../../../shared/constants/formatted-units';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { BottlingForm } from './form';
import { StorageFillingLevelsComponent } from './storage-filling-levels/storage-filling-levels.component';

@Component({
  selector: 'app-add-bottle',
  providers: [provideNativeDateAdapter(), CompaniesService, BottlingService],
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
    UnitPipe,
    StorageFillingLevelsComponent,
    FileDragAndDropComponent,
    FileCardComponent,
  ],
  templateUrl: './add-bottle.component.html',
})
export class AddBottleComponent {
  router = inject(Router);
  unitsService = inject(UnitsService);
  companiesService = inject(CompaniesService);
  processService = inject(BottlingService);

  protected readonly FileTypes = FileTypes;
  protected readonly TransportType = TransportMode;
  protected readonly FuelType = FuelType;
  protected readonly FormattedUnits = FormattedUnits;

  dateDelimiter: Date = new Date();
  uploadedFiles: File[] = [];

  bottleFormGroup: FormGroup<BottlingForm> = new FormGroup({
    date: new FormControl<Date | undefined>(new Date(), Validators.required),
    time: new FormControl<Date | undefined>(new Date(), Validators.required),
    amount: new FormControl<number | undefined>(undefined, [Validators.required, Validators.min(1)]),
    recipient: new FormControl<UserDto | undefined>(undefined, Validators.required),
    storageUnit: new FormControl<HydrogenStorageOverviewDto | undefined>(undefined, Validators.required),
    type: new FormControl<'MIX' | 'GREEN' | undefined>(undefined, Validators.required),
    transportMode: new FormControl<TransportMode | null>(null, Validators.required),
    fuelType: new FormControl<FuelType | null>(null),
    distance: new FormControl<number | null>(null),
  });

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  recipientsQuery = injectQuery(() => ({
    queryKey: ['recipients'],
    queryFn: () => this.companiesService.getCompanies(),
  }));

  mutation = injectMutation(() => ({
    mutationFn: (dto: FormData) => this.processService.createBottleBatch(dto),
    onSuccess: () => {
      toast.success('Successfully created.');
      this.router.navigateByUrl('bottling');
    },
    onError: (e) => toast.error(e.message),
  }));

  constructor() {
    this.bottleFormGroup.controls.transportMode.valueChanges.subscribe((transportMode) =>
      this.onTransportModeChange(transportMode),
    );

    this.bottleFormGroup.controls.amount?.valueChanges.subscribe((amount) => this.onAmountChnage(amount));
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
    data.append('color', this.bottleFormGroup.value.type ?? '');
    data.append('transportMode', this.bottleFormGroup.value.transportMode ?? '');
    data.append('fuelType', this.bottleFormGroup.value.fuelType ?? '');
    data.append('distance', this.bottleFormGroup.value.distance?.toString() ?? '');

    this.mutation.mutate(data);
  }

  private createTimestamp() {
    let pickedDate = new Date();
    let pickedTimeAsDate = new Date();

    if (this.bottleFormGroup.controls['date']?.value && this.bottleFormGroup.controls['time']?.value) {
      pickedDate = new Date(this.bottleFormGroup.controls['date'].value);
      pickedTimeAsDate = new Date(this.bottleFormGroup.controls['time'].value);
      pickedDate.setHours(pickedTimeAsDate.getHours());
      pickedDate.setMinutes(pickedTimeAsDate.getMinutes());
    } else {
      throw new Error('No Date and/or Time Found');
    }

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

  private onAmountChnage(amount: number | null | undefined) {
    if (!amount) return;

    this.bottleFormGroup.controls.type.reset();

    if (this.bottleFormGroup.value?.storageUnit && amount > this.bottleFormGroup.value?.storageUnit?.filling)
      this.bottleFormGroup.controls.storageUnit?.reset();
  }

  displayComposition(hydrogenComposition: HydrogenComponentDto[]) {
    const sum = hydrogenComposition.reduce((a, b) => a + b.amount, 0);
    return hydrogenComposition.map((c) => ` ${c.color.toLowerCase()} (${((c.amount * 100) / sum).toFixed(2)} %)`);
  }

  isAmountAvailable(requestedAmount: number | null, hydrogenComposition: HydrogenComponentDto[]) {
    if (!requestedAmount) return false;
    const greenAmount = this.getAvailableGreenAmount(hydrogenComposition);
    return requestedAmount <= greenAmount;
  }

  getAvailableGreenAmount(hydrogenComposition: HydrogenComponentDto[]) {
    return hydrogenComposition.find((item) => item.color === 'GREEN')?.amount ?? 0;
  }
}
