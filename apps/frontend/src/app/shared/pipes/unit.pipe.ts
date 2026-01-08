/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DecimalPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unit',
})
export class UnitPipe implements PipeTransform {
  decimalPipe = new DecimalPipe('en-GB');

  transform(value: number | null | undefined, unit: string): string {
    const formatted = this.decimalPipe.transform(value, '1.2-2');

    if (!formatted) return '';
    return `${formatted} ${unit}`;
  }
}
