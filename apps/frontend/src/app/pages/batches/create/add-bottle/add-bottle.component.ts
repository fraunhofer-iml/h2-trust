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
import { ComponentsOverviewDto, HydrogenComponentDto, ProcessStepOverviewDto, UserDto } from '@h2-trust/contracts/dtos';
import {
  FuelType,
  MeasurementUnit,
  PowerType,
  ProcessType,
  ProcessTypeToUnitType,
  RfnboType,
  TransportType,
  UnitType,
} from '@h2-trust/domain';
import { FileDragAndDropComponent } from '../../../../layout/drag-and-drop/file-drag-and-drop.component';
import { FileCardComponent } from '../../../../layout/file-card/file-card.component';
import { TypeSelectionComponent } from '../../../../layout/type-selection/type-selection.component';
import { FileTypes } from '../../../../shared/constants/file-types';
import { H2TrustRouterLinks } from '../../../../shared/constants/router-links';
import { H2TrustRoutes } from '../../../../shared/constants/routes';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { companiesQueryOptions } from '../../../../shared/queries/companies.query';
import { QueryKeyPrefix } from '../../../../shared/queries/shared-query-keys';
import { componentOverviewsQueryOptions } from '../../../../shared/queries/units.query';
import { BottlingService } from '../../../../shared/services/bottling/bottling.service';
import { CompaniesService } from '../../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { handleMutationWithPromiseToast } from '../../../../shared/util/query-error-handler';
import { BottlingForm } from './form';
import { StorageFillingLevelsComponent } from './storage-filling-levels/storage-filling-levels.component';

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
    EnumPipe,
    FileDragAndDropComponent,
    FileCardComponent,
    TypeSelectionComponent,
    UnitPipe,
    StorageFillingLevelsComponent,
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
  protected readonly TransportType = TransportType;
  protected readonly FuelType = FuelType;
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly RfnboType = RfnboType;
  protected readonly bottleTypes = [RfnboType.RFNBO_READY, RfnboType.NON_CERTIFIABLE] as const;
  protected readonly H2TrustRouterLinks = H2TrustRouterLinks;

  dateDelimiter: Date = new Date();
  uploadedFiles: File[] = [];
  selectedChartData: ComponentsOverviewDto[] = [];

  ProcessType = ProcessType;
  protected readonly availableProcessTypes = Object.values(ProcessType).filter(
    (type) =>
      type !== ProcessType.WATER_CONSUMPTION &&
      type !== ProcessType.POWER_PRODUCTION &&
      type !== ProcessType.HYDROGEN_PRODUCTION,
  );

  bottleFormGroup: FormGroup<BottlingForm> = new FormGroup({
    date: new FormControl<Date | undefined>(new Date(), Validators.required),
    time: new FormControl<Date | undefined>(new Date(), Validators.required),
    amount: new FormControl<number | undefined>(undefined, [Validators.required, Validators.min(1)]),
    recipient: new FormControl<UserDto | undefined>(undefined, Validators.required),
    predecessorUnit: new FormControl<ComponentsOverviewDto | undefined>(undefined, Validators.required),
    executingUnit: new FormControl<ComponentsOverviewDto | undefined>(undefined, Validators.required),
    type: new FormControl<'NON_CERTIFIABLE' | 'RFNBO_READY' | undefined>(undefined, Validators.required),
    distance: new FormControl<number | null>(null),
    renewable_power: new FormControl<number | null>(null),
    grid_power: new FormControl<number | null>(null),
    compressed_air: new FormControl<number | null>(null),
    nitrogen: new FormControl<number | null>(null),
    processType: new FormControl<ProcessType | null>(null),
  });

  changeValue() {
    this.selectedChartData = this.bottleFormGroup.value?.predecessorUnit
      ? [this.bottleFormGroup.value?.predecessorUnit]
      : [];
    console.log(this.selectedChartData);
  }

  //hydrogenStorageQuery = injectQuery(() => componentOverviewQueryOptions(this.unitsService, 'hydrogen-storage-unit-0'));
  hydrogenStorageQuery = injectQuery(() => componentOverviewsQueryOptions(this.unitsService));

  recipientsQuery = injectQuery(() => companiesQueryOptions(this.companiesService));

  mutation = injectMutation(() => ({
    mutationFn: async (dto: FormData) => {
      await handleMutationWithPromiseToast<ProcessStepOverviewDto>(
        this.processService.createBottleBatch(dto),
        'Successfully created',
      );
      await this.queryClient.invalidateQueries({
        queryKey: [QueryKeyPrefix.UNITS, UnitType.HYDROGEN_STORAGE],
      });
      await this.queryClient.invalidateQueries({
        queryKey: [QueryKeyPrefix.BOTTLING],
      });
      this.router.navigateByUrl(H2TrustRoutes.BATCHES);
    },
  }));

  constructor() {
    this.bottleFormGroup.controls.processType.valueChanges.subscribe((processType) =>
      this.onProcessTypeChange(processType),
    );

    this.bottleFormGroup.controls.amount?.valueChanges.subscribe((amount) => this.onAmountChange(amount));
  }

  get bottleTypeControl() {
    return this.bottleFormGroup.controls.type as FormControl<RfnboType | undefined>;
  }

  getNonEmptyUnits() {
    if (!this.hydrogenStorageQuery || !this.hydrogenStorageQuery.data()) {
      return [];
    }
    return this.hydrogenStorageQuery.data()!.filter((component) => component.filling > 0);
  }

  getUnitsForSelectedProcessType() {
    if (!this.hydrogenStorageQuery || !this.hydrogenStorageQuery.data()) {
      return [];
    }
    const selectedProcessType: ProcessType = this.bottleFormGroup.controls.processType.value as ProcessType;
    const selectedUnitType: UnitType = ProcessTypeToUnitType[selectedProcessType];
    return this.hydrogenStorageQuery.data()!.filter((component) => component.unitType === selectedUnitType);
  }

  isTrailerTransport() {
    const isTrailerTransport =
      this.bottleFormGroup.controls.executingUnit.value?.unitDetailsType == TransportType.TRAILER;
    const isHydrogenTransportation =
      this.bottleFormGroup.controls.processType.value === ProcessType.HYDROGEN_TRANSPORTATION;
    return isHydrogenTransportation && isTrailerTransport;
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
    data.append('processType', this.bottleFormGroup.value?.processType?.toString() ?? '');
    data.append('recipient', this.bottleFormGroup.value.recipient?.id ?? '');
    data.append('filledAt', this.createTimestamp().toISOString());
    data.append('recordedBy', '');
    data.append('executingUnitId', this.bottleFormGroup.value?.executingUnit?.id.toString() ?? '');
    data.append('predecessorUnitId', this.bottleFormGroup.value?.predecessorUnit?.id.toString() ?? '');

    //qualityDetails
    data.append('rfnboType', this.bottleFormGroup.value.type ?? '');
    data.append('productionPowerType', PowerType.NOT_SPECIFIED);
    data.append('distance', this.bottleFormGroup.value.distance?.toString() ?? '0');
    data.append('usedRenewablePower', this.bottleFormGroup.value.renewable_power?.toString() ?? '0');
    data.append('usedGridPower', this.bottleFormGroup.value.grid_power?.toString() ?? '0');
    data.append('compressedAir', this.bottleFormGroup.value.compressed_air?.toString() ?? '0');
    data.append('nitrogenConsumption', this.bottleFormGroup.value.nitrogen?.toString() ?? '0');

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

  private onProcessTypeChange(processType: ProcessType | null) {
    if (!processType) return;

    const selectedProcessType: ProcessType = this.bottleFormGroup.controls.processType.value as ProcessType;

    const distanceControl = this.bottleFormGroup.controls.distance;
    const renewablePowerControl = this.bottleFormGroup.controls.renewable_power;
    const gridPowerControl = this.bottleFormGroup.controls.grid_power;
    const compressedAirControl = this.bottleFormGroup.controls.compressed_air;
    const nitrogenControl = this.bottleFormGroup.controls.nitrogen;

    if (this.isTrailerTransport()) {
      distanceControl.addValidators([Validators.required, Validators.min(1)]);
      renewablePowerControl.removeValidators([Validators.required, Validators.min(1)]);
      renewablePowerControl.setValue(null);
      gridPowerControl.removeValidators([Validators.required, Validators.min(1)]);
      gridPowerControl.setValue(null);
      compressedAirControl.removeValidators([Validators.required, Validators.min(1)]);
      compressedAirControl.setValue(null);
      nitrogenControl.removeValidators([Validators.required, Validators.min(1)]);
      nitrogenControl.setValue(null);
    }
    if (selectedProcessType === ProcessType.HYDROGEN_BOTTLING) {
      renewablePowerControl.addValidators([Validators.required, Validators.min(1)]);
      gridPowerControl.addValidators([Validators.required, Validators.min(1)]);
      compressedAirControl.addValidators([Validators.required, Validators.min(1)]);
      nitrogenControl.addValidators([Validators.required, Validators.min(1)]);
      distanceControl.removeValidators([Validators.required, Validators.min(1)]);
      distanceControl.setValue(null);
    }
    if (
      selectedProcessType === ProcessType.HYDROGEN_COMPRESSION ||
      selectedProcessType === ProcessType.HYDROGEN_END_USE
    ) {
      renewablePowerControl.addValidators([Validators.required, Validators.min(1)]);
      gridPowerControl.addValidators([Validators.required, Validators.min(1)]);
      distanceControl.removeValidators([Validators.required, Validators.min(1)]);
      distanceControl.setValue(null);
      compressedAirControl.removeValidators([Validators.required, Validators.min(1)]);
      compressedAirControl.setValue(null);
      nitrogenControl.removeValidators([Validators.required, Validators.min(1)]);
      nitrogenControl.setValue(null);
    }

    distanceControl.updateValueAndValidity();
    renewablePowerControl.updateValueAndValidity();
    gridPowerControl.updateValueAndValidity();
    compressedAirControl.updateValueAndValidity();
    nitrogenControl.updateValueAndValidity();
  }

  private onAmountChange(amount: number | null | undefined) {
    if (!amount) return;

    this.bottleFormGroup.controls.type.reset();

    if (this.bottleFormGroup.value?.predecessorUnit && amount > this.bottleFormGroup.value?.predecessorUnit?.filling)
      this.bottleFormGroup.controls.predecessorUnit?.reset();
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
