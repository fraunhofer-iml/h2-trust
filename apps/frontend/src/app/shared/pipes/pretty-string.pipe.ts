/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pretty',
})
export class PrettyStringPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) {
      return '';
    }

    return value.split('_').join(' ').toLowerCase();
  }
}
