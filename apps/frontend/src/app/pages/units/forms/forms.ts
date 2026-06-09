/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  BiddingZone,
  FuelType,
  HydrogenProductionTechnology,
  HydrogenProductionType,
  HydrogenStorageType,
  PowerProductionType,
  TransportType,
  UnitType,
} from '@h2-trust/domain';
import { integerValidator, positiveNumberValidator } from '../../../shared/util/number-validators';

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
  method: FormControl<HydrogenProductionType | null>;
  technology: FormControl<HydrogenProductionTechnology | null>;
  waterConsumptionLitersPerHour: FormControl<number | null>;
};
export type HydrogenStorageFormGroup = {
  capacity: FormControl<number | null>;
  storageType: FormControl<HydrogenStorageType | null>;
};

export type PowerProductionFormGroup = {
  biddingZone: FormControl<BiddingZone | null>;
  ratedPower: FormControl<number | null>;
  powerProductionType: FormControl<PowerProductionType | null>;
  decommissioningPlannedOn: FormControl<Date | null>;
  financialSupportReceived: FormControl<boolean | null>;
};

export type HydrogenTransportFormGroup = {
  transportType: FormControl<TransportType | null>;
  fuelType: FormControl<FuelType | null>;
};

export const newUnitForm = () =>
  new FormGroup<UnitFormGroup>({
    name: new FormControl<string | null>(null, Validators.required),
    unitType: new FormControl<UnitType | null>(null, Validators.required),
    owner: new FormControl<string | null>(null, Validators.required),
    certifiedBy: new FormControl<string | null>(null, Validators.required),
    operator: new FormControl<string | null>(null, Validators.required),
    manufacturer: new FormControl<string | null>(null, Validators.required),
    modelType: new FormControl<string | null>(null, Validators.required),
    modelNumber: new FormControl<string | null>(null, Validators.required),
    serialNumber: new FormControl<string | null>(null, Validators.required),
    commissionedOn: new FormControl<Date | null>(null, Validators.required),
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

export const newHydrogenStorageForm = () =>
  new FormGroup<HydrogenStorageFormGroup>({
    capacity: new FormControl<number | null>(null, {
      validators: [positiveNumberValidator, integerValidator],
    }),
    storageType: new FormControl<HydrogenStorageType | null>(null, Validators.required),
  });

export const newPowerProductionForm = () =>
  new FormGroup<PowerProductionFormGroup>({
    biddingZone: new FormControl<BiddingZone | null>(null, Validators.required),
    ratedPower: new FormControl<number | null>(null, {
      validators: [positiveNumberValidator],
    }),
    powerProductionType: new FormControl<PowerProductionType | null>(null, Validators.required),
    decommissioningPlannedOn: new FormControl<Date | null>(null, Validators.required),
    financialSupportReceived: new FormControl<boolean | null>(false),
  });

export const newHydrogenProductionForm = () =>
  new FormGroup<HydrogenProductionFormGroup>({
    biddingZone: new FormControl<BiddingZone | null>(null, Validators.required),
    ratedPower: new FormControl<number | null>(null, {
      validators: [positiveNumberValidator],
    }),
    method: new FormControl<HydrogenProductionType | null>(null, Validators.required),
    technology: new FormControl<HydrogenProductionTechnology | null>(null, Validators.required),
    waterConsumptionLitersPerHour: new FormControl<number | null>(null, {
      validators: [positiveNumberValidator],
    }),
  });

export const newHydrogenTransportForm = () =>
  new FormGroup<HydrogenTransportFormGroup>({
    transportType: new FormControl<TransportType | null>(null, Validators.required),
    fuelType: new FormControl<FuelType | null>(null, Validators.required),
  });

export const addValidatorsToFormGroup = (formGroup: FormGroup): void => {
  const excludeKeys = ['decommissioningPlannedOn', 'gridConnectionNumber', 'gridOperator'];
  Object.keys(formGroup.controls).forEach((key) => {
    if (excludeKeys.includes(key)) return;
    const control = formGroup.get(key);
    if (!control) return;
    const existingValidator = control.validator;
    const existingValidators: ValidatorFn[] = existingValidator ? [existingValidator] : [];
    const validators: ValidatorFn[] = [...existingValidators, Validators.required];
    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  });
};
