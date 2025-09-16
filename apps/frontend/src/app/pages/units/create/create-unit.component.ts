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
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import {
  BiddingZones,
  ElectrolysisType,
  GridLevel,
  HydrogenProductionType,
  HydrogenProductionUnitCreateDto,
  HydrogenStorageType,
  HydrogenStorageUnitCreateDto,
  PowerProductionType,
  PowerProductionUnitCreateDto,
  UnitCreateDto,
  UnitType,
} from '@h2-trust/api';
import { H2_PRODUCTION_TYPES } from '../../../shared/constants/hydrogen-production-types';
import { PrettyEnumPipe } from '../../../shared/pipes/format-enum.pipe';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import {
  addValidatorsToFormGroup,
  HydrogenProductionFormGroup,
  HydrogenStorageFormGroup,
  newH2ProductionForm,
  newH2StorageForm,
  newPowerProductionForm,
  newUnitForm,
  PowerProductionFormGroup,
  UnitFormGroup,
} from './forms';

@Component({
  selector: 'app-create-unit',
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RouterModule,
    MatDatepickerModule,
    MatButtonModule,
    MatSelectModule,
    PrettyEnumPipe,
  ],
  providers: [provideNativeDateAdapter(), CompaniesService],
  templateUrl: './create-unit.component.html',
})
export class CreateUnitComponent {
  unitsService = inject(UnitsService);
  companiesService = inject(CompaniesService);
  router = inject(Router);

  UnitType = UnitType;
  HydrogenProductionType = HydrogenProductionType;
  HydrogenStorageType = HydrogenStorageType;

  availableBiddingZones = Object.entries(BiddingZones);
  availableGridLevels = Object.entries(GridLevel);
  availableTechnologies: [string, ElectrolysisType][] = [];
  availablePowerProductionType = Object.entries(PowerProductionType);

  unitForm: FormGroup<UnitFormGroup> = newUnitForm();
  hydrogenProductionForm: FormGroup<HydrogenProductionFormGroup> = newH2ProductionForm();
  hydrogenStorageForm: FormGroup<HydrogenStorageFormGroup> = newH2StorageForm();
  powerProductionForm: FormGroup<PowerProductionFormGroup> = newPowerProductionForm();
  selectedForm:
    | FormGroup<PowerProductionFormGroup>
    | FormGroup<HydrogenStorageFormGroup>
    | FormGroup<HydrogenProductionFormGroup> = this.hydrogenProductionForm;

  constructor() {
    this.hydrogenProductionForm.controls.method.valueChanges.subscribe((value) => this.onH2ProductionTypeChange(value));
    this.unitForm.controls.unitType.valueChanges.subscribe((value) => this.onUnitTypeChange(value));
  }

  companiesQuery = injectQuery(() => ({
    queryKey: ['recipients'],
    queryFn: () => this.companiesService.getCompanies(),
  }));

  createMutation = injectMutation(() => ({
    mutationFn: (dto: UnitCreateDto) => this.unitsService.createUnit(dto),
    onError: (e) => toast.error(e.message),
    onSuccess: () => {
      this.router.navigateByUrl('units');
      toast.success('Successfully created.');
    },
  }));

  get selectedType() {
    return this.unitForm.get('unitType') as FormControl;
  }

  save() {
    const type = this.unitForm.controls.unitType.value;
    if (!type) return;

    let dto: UnitCreateDto = {
      ...this.unitForm.value,
      commissionedOn: this.unitForm.value.commissionedOn?.toISOString(),
      unitType: type,
    } as UnitCreateDto;

    if (type === UnitType.HYDROGEN_PRODUCTION) {
      const additional = this.hydrogenProductionForm.value;
      dto = {
        ...dto,
        ...additional,
        hydrogenProductionMethod: additional.method,
        hydrogenProductionTechnology: additional.technology,
      } as HydrogenProductionUnitCreateDto;
    } else if (type === UnitType.HYDROGEN_STORAGE)
      dto = {
        ...dto,
        ...this.hydrogenStorageForm.value,
      } as HydrogenStorageUnitCreateDto;
    else if (type === UnitType.POWER_PRODUCTION)
      dto = {
        ...dto,
        ...this.powerProductionForm.value,
      } as PowerProductionUnitCreateDto;

    this.createMutation.mutate(dto);
  }

  private onH2ProductionTypeChange(value: HydrogenProductionType | null) {
    if (!value) this.hydrogenProductionForm.controls.technology.disable();
    else {
      this.hydrogenProductionForm.controls.technology.enable();
      const method = H2_PRODUCTION_TYPES.get(value);
      this.availableTechnologies = method ? Object.entries(method) : [];
    }
  }

  private onUnitTypeChange(value: UnitType | null) {
    if (value === UnitType.HYDROGEN_PRODUCTION) {
      this.powerProductionForm.removeValidators(Validators.required);
      this.hydrogenStorageForm.removeValidators(Validators.required);
      this.selectedForm = this.hydrogenProductionForm;
    } else if (value === UnitType.POWER_PRODUCTION) {
      this.hydrogenProductionForm.removeValidators(Validators.required);
      this.hydrogenStorageForm.removeValidators(Validators.required);
      this.selectedForm = this.powerProductionForm;
    } else {
      this.powerProductionForm.removeValidators(Validators.required);
      this.hydrogenProductionForm.removeValidators(Validators.required);
      this.selectedForm = this.hydrogenStorageForm;
    }
    addValidatorsToFormGroup(this.selectedForm);
  }
}
