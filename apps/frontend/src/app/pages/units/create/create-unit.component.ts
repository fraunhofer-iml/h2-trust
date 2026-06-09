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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { toast } from 'ngx-sonner';
import {
  HydrogenBottlingUnitInputDto,
  HydrogenCompressorUnitInputDto,
  HydrogenEndUseUnitInputDto,
  HydrogenProductionUnitInputDto,
  HydrogenStorageUnitInputDto,
  HydrogenTransportUnitInputDto,
  PowerProductionUnitInputDto,
  UnitInputDto,
} from '@h2-trust/contracts/dtos';
import { HydrogenProductionType, HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { TypeSelectionComponent } from '../../../layout/type-selection/type-selection.component';
import { H2TrustRoutes } from '../../../shared/constants/routes';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { toastQueryError } from '../../../shared/util/query-error-handler';
import { BaseUnitFormComponent } from '../forms/base-unit/base-unit-form-component';
import {
  addValidatorsToFormGroup,
  HydrogenProductionFormGroup,
  HydrogenStorageFormGroup,
  HydrogenTransportFormGroup,
  newHydrogenProductionForm,
  newHydrogenStorageForm,
  newHydrogenTransportForm,
  newPowerProductionForm,
  newUnitForm,
  PowerProductionFormGroup,
  UnitFormGroup,
} from '../forms/forms';
import { HydrogenProductionUnitFormComponent } from '../forms/hydrogen-production/hydrogen-production-unit-form.component';
import { HydrogenUnitFormComponent } from '../forms/hydrogen-storage/hydrogen-storage-unit-form.component';
import { HydrogenTransportComponent } from '../forms/hydrogen-transport/hydrogen-transport.component';
import { PowerProductionUnitFormComponent } from '../forms/power-production/power-production-unit-form.component';

@Component({
  selector: 'app-create-unit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RouterModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    BaseUnitFormComponent,
    HydrogenProductionUnitFormComponent,
    PowerProductionUnitFormComponent,
    HydrogenUnitFormComponent,
    TypeSelectionComponent,
    HydrogenTransportComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './create-unit.component.html',
})
export class CreateUnitComponent {
  protected readonly UnitType = UnitType;
  protected readonly HydrogenProductionType = HydrogenProductionType;
  protected readonly HydrogenStorageType = HydrogenStorageType;
  protected readonly unitTypes = Object.values(UnitType);

  unitsService = inject(UnitsService);
  companiesService = inject(CompaniesService);
  router = inject(Router);
  queryClient = inject(QueryClient);

  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newHydrogenProductionForm();
  hydrogenStorageForm: FormGroup<HydrogenStorageFormGroup> = newHydrogenStorageForm();
  powerProductionForm: FormGroup<PowerProductionFormGroup> = newPowerProductionForm();
  hydrogenTransportForm: FormGroup<HydrogenTransportFormGroup> = newHydrogenTransportForm();
  selectedForm:
    | FormGroup<PowerProductionFormGroup>
    | FormGroup<HydrogenStorageFormGroup>
    | FormGroup<HydrogenProductionFormGroup>
    | FormGroup<HydrogenTransportFormGroup>
    | null = null;

  // HYDROGEN STORAGE
  createHydrogenStorageUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenStorageUnitInputDto) => this.unitsService.createHydrogenStorageUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  // POWER PRODUCTION
  createPowerProductionUnitMutation = injectMutation(() => ({
    mutationFn: (dto: PowerProductionUnitInputDto) => this.unitsService.createPowerProductionUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  // PRODUCTION
  createHydrogenProductionUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenProductionUnitInputDto) => this.unitsService.createHydrogenProductionUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  // COMPRESSION
  createHydrogenCompressionUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenCompressorUnitInputDto) => this.unitsService.createHydrogenCompressionUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  // BOTTLING
  createHydrogenBottlingUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenBottlingUnitInputDto) => this.unitsService.createHydrogenBottlingUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  // TRANSPORT
  createHydrogenTransportUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenTransportUnitInputDto) => this.unitsService.createHydrogenTransportUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  // END USE
  createHydrogenEndUseUnitMutation = injectMutation(() => ({
    mutationFn: (dto: HydrogenEndUseUnitInputDto) => this.unitsService.createHydrogenEndUseUnit(dto),
    onError: (e) => toastQueryError(e),
    onSuccess: () => this.onSuccess(),
  }));

  private async onSuccess() {
    await this.queryClient.invalidateQueries({ queryKey: [QueryKeyPrefix.UNITS] });
    toast.success('Successfully created.');
    this.router.navigateByUrl(H2TrustRoutes.UNITS);
  }

  constructor() {
    this.unitForm.controls.unitType.valueChanges.subscribe((value) => this.onUnitTypeChange(value));
  }

  get selectedType() {
    return this.unitForm.get('unitType') as FormControl;
  }

  save() {
    const type = this.unitForm.controls.unitType.value;
    if (!type) return;

    console.log(type);

    const baseDto: UnitInputDto = {
      ...this.unitForm.value,
      commissionedOn: this.unitForm.value.commissionedOn,
      unitType: type,
    } as UnitInputDto;

    if (type === UnitType.HYDROGEN_PRODUCTION) {
      const additional = this.hydrogenProductionForm.value;
      const dto = {
        ...baseDto,
        ...additional,
        method: additional.method,
        technology: additional.technology,
        waterConsumptionLitersPerHour: additional.waterConsumptionLitersPerHour,
      } as HydrogenProductionUnitInputDto;
      return this.createHydrogenProductionUnitMutation.mutate(dto);
    }

    if (type === UnitType.HYDROGEN_STORAGE) {
      const dto = {
        ...baseDto,
        ...this.hydrogenStorageForm.value,
        storageType: this.hydrogenStorageForm.value.storageType,
      } as HydrogenStorageUnitInputDto;
      return this.createHydrogenStorageUnitMutation.mutate(dto);
    }

    if (type === UnitType.POWER_PRODUCTION) {
      const dto = {
        ...baseDto,
        ...this.powerProductionForm.value,
      } as PowerProductionUnitInputDto;
      return this.createPowerProductionUnitMutation.mutate(dto);
    }

    if (type === UnitType.COMPRESSION) {
      const dto = {
        ...baseDto,
      } as HydrogenCompressorUnitInputDto;
      return this.createHydrogenCompressionUnitMutation.mutate(dto);
    }

    if (type === UnitType.BOTTLING) {
      const dto = {
        ...baseDto,
      } as HydrogenBottlingUnitInputDto;
      return this.createHydrogenBottlingUnitMutation.mutate(dto);
    }

    if (type === UnitType.TRANSPORTATION) {
      const additional = this.hydrogenTransportForm.value;
      const dto = {
        ...baseDto,
        ...additional,
      } as HydrogenTransportUnitInputDto;
      return this.createHydrogenTransportUnitMutation.mutate(dto);
    }

    if (type === UnitType.END_USE) {
      const dto = {
        ...baseDto,
      } as HydrogenEndUseUnitInputDto;
      return this.createHydrogenEndUseUnitMutation.mutate(dto);
    }
  }

  private onUnitTypeChange(value: UnitType | null) {
    if (value === UnitType.HYDROGEN_PRODUCTION) {
      this.powerProductionForm.removeValidators(Validators.required);
      this.hydrogenStorageForm.removeValidators(Validators.required);
      this.hydrogenTransportForm.removeValidators(Validators.required);
      this.selectedForm = this.hydrogenProductionForm;
    } else if (value === UnitType.POWER_PRODUCTION) {
      this.hydrogenProductionForm.removeValidators(Validators.required);
      this.hydrogenStorageForm.removeValidators(Validators.required);
      this.hydrogenTransportForm.removeValidators(Validators.required);
      this.selectedForm = this.powerProductionForm;
    } else if (value === UnitType.TRANSPORTATION) {
      this.hydrogenProductionForm.removeValidators(Validators.required);
      this.hydrogenStorageForm.removeValidators(Validators.required);
      this.powerProductionForm.removeValidators(Validators.required);
      this.selectedForm = this.hydrogenTransportForm;
    } else if (value === UnitType.HYDROGEN_STORAGE) {
      this.powerProductionForm.removeValidators(Validators.required);
      this.hydrogenProductionForm.removeValidators(Validators.required);
      this.hydrogenTransportForm.removeValidators(Validators.required);
      this.selectedForm = this.hydrogenStorageForm;
    } else {
      this.powerProductionForm.removeValidators(Validators.required);
      this.hydrogenProductionForm.removeValidators(Validators.required);
      this.hydrogenStorageForm.removeValidators(Validators.required);
      this.hydrogenTransportForm.removeValidators(Validators.required);
      this.selectedForm = null;
    }
    if (this.selectedForm) addValidatorsToFormGroup(this.selectedForm);
  }
}
