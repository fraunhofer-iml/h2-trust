/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'compact' })
export class CompactPipe implements PipeTransform {
  transform(value: string | null) {
    if (!value) {
      return 'Not available';
    }

    const leadingChars = 6;
    const trailingChars = 4;

    if (value.length <= leadingChars + trailingChars + 3) {
      return value;
    }

    return `${value.slice(0, leadingChars)}...${value.slice(-trailingChars)}`;
  }
}
