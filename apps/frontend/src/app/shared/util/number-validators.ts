/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const noNegativeZeroValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value < 0) {
    return { negativeNotAllowed: true };
  }
  if (Object.is(value, -0)) {
    return { negativeZeroNotAllowed: true };
  }
  return null;
};

export const integerValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value;
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return { notAnInteger: true };
  }

  return null;
};
