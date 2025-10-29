/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AbstractControl, FormArray, ValidationErrors } from '@angular/forms';

export function minFormArrayLength(min: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control instanceof FormArray && control.length < min) {
      return { minLengthArray: { requiredLength: min, actualLength: control.length } };
    }
    return null;
  };
}
