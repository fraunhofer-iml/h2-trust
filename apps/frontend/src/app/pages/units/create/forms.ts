/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  BiddingZone,
  GridLevel,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  PowerProductionType,
  UnitType,
} from '@h2-trust/domain';

export type UnitFormGroup = {
  name: FormControl<string | null>;
  unitType: FormControl<UnitType | null>;
  owner: FormControl<string | null>;
  certifiedBy: FormControl<string | null>;
  operator: FormControl<string | null>;
  manufacturer: FormControl<string | null>;
  modelType: FormControl<string | null>;
  modelNumber: FormControl<string | null>;
  serialNumber: FormControl<string | null>;
  commissionedOn: FormControl<Date | null>;
  mastrNumber: FormControl<string | null>;
  address: FormGroup<{
    street: FormControl<string | null>;
    postalCode: FormControl<string | null>;
    city: FormControl<string | null>;
    state: FormControl<string | null>;
    country: FormControl<string | null>;
  }>;
};

export type HydrogenProductionFormGroup = {
  biddingZone: FormControl<BiddingZone | null>;
  ratedPower: FormControl<number | null>;
  method: FormControl<HydrogenProductionMethod | null>;
  technology: FormControl<HydrogenProductionTechnology | null>;
  pressure: FormControl<number | null>;
};
export type HydrogenStorageFormGroup = {
  capacity: FormControl<number | null>;
  pressure: FormControl<number | null>;
  hydrogenStorageType: FormControl<HydrogenStorageType | null>;
};

export type PowerProductionFormGroup = {
  biddingZone: FormControl<BiddingZone | null>;
  gridOperator: FormControl<string | null>;
  gridLevel: FormControl<GridLevel | null>;
  gridConnectionNumber: FormControl<string | null>;
  ratedPower: FormControl<number | null>;
  electricityMeterNumber: FormControl<string | null>;
  powerProductionType: FormControl<PowerProductionType | null>;
  decommissioningPlannedOn: FormControl<Date | null>;
};

export const newUnitForm = () =>
  new FormGroup<UnitFormGroup>({
    name: new FormControl<string | null>(null, Validators.required),
    unitType: new FormControl<UnitType | null>(null),
    owner: new FormControl<string | null>(null, Validators.required),
    certifiedBy: new FormControl<string | null>(null),
    operator: new FormControl<string | null>(null),
    manufacturer: new FormControl<string | null>(null),
    modelType: new FormControl<string | null>(null),
    modelNumber: new FormControl<string | null>(null),
    serialNumber: new FormControl<string | null>(null),
    commissionedOn: new FormControl<Date | null>(null, Validators.required),
    mastrNumber: new FormControl<string | null>(null, Validators.required),
    address: new FormGroup<{
      street: FormControl<string | null>;
      postalCode: FormControl<string | null>;
      city: FormControl<string | null>;
      state: FormControl<string | null>;
      country: FormControl<string | null>;
    }>({
      street: new FormControl<string | null>(null, Validators.required),
      postalCode: new FormControl<string | null>(null, Validators.required),
      city: new FormControl<string | null>(null, Validators.required),
      state: new FormControl<string | null>(null, Validators.required),
      country: new FormControl<string | null>(null, Validators.required),
    }),
  });

export const newH2StorageForm = () =>
  new FormGroup<HydrogenStorageFormGroup>({
    capacity: new FormControl<number | null>(null, Validators.required),
    pressure: new FormControl<number | null>(null, Validators.required),
    hydrogenStorageType: new FormControl<HydrogenStorageType | null>(null, Validators.required),
  });

export const newPowerProductionForm = () =>
  new FormGroup<PowerProductionFormGroup>({
    biddingZone: new FormControl<BiddingZone | null>(null, Validators.required),
    gridOperator: new FormControl<string | null>(null),
    gridLevel: new FormControl<GridLevel | null>(null, Validators.required),
    gridConnectionNumber: new FormControl<string | null>(null),
    ratedPower: new FormControl<number | null>(null, Validators.required),
    electricityMeterNumber: new FormControl<string | null>(null, Validators.required),
    powerProductionType: new FormControl<PowerProductionType | null>(null, Validators.required),
    decommissioningPlannedOn: new FormControl<Date | null>(null),
  });

export const newH2ProductionForm = () =>
  new FormGroup<HydrogenProductionFormGroup>({
    biddingZone: new FormControl<BiddingZone | null>(null, Validators.required),
    ratedPower: new FormControl<number | null>(null, Validators.required),
    method: new FormControl<HydrogenProductionMethod | null>(null, Validators.required),
    technology: new FormControl<HydrogenProductionTechnology | null>(
      { value: null, disabled: true },
      Validators.required,
    ),
    pressure: new FormControl<number | null>(null, Validators.required),
  });

export const addValidatorsToFormGroup = (formGroup: FormGroup): void => {
  const excludeKeys = ['decommissioningPlannedOn', 'gridConnectionNumber', 'gridOperator'];
  Object.keys(formGroup.controls).forEach((key) => {
    if (!excludeKeys.includes(key)) {
      const control = formGroup.get(key);
      if (control) {
        control.setValidators(Validators.required);
        control.updateValueAndValidity();
      }
    }
  });
};
