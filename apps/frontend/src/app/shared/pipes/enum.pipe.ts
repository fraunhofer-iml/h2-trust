/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ENUM_LABEL_RESOLVERS } from '../constants/eum-label-resolvers';
import { EnumLabelKey } from '../model/enum-label-key.type';

type EnumValueForKey<K extends EnumLabelKey> = Parameters<(typeof ENUM_LABEL_RESOLVERS)[K]>[0];

@Pipe({
  name: 'enum',
})
export class EnumPipe implements PipeTransform {
  transform<K extends EnumLabelKey>(value: EnumValueForKey<K> | null | undefined, key: K): string {
    if (!value) {
      return '';
    }

    const resolver = ENUM_LABEL_RESOLVERS[key] as (input: EnumValueForKey<K>) => string;

    return resolver(value);
  }
}
