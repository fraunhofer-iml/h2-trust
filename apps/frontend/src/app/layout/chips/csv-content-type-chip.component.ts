/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { CsvContentType } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-csv-content-type-chip',
  standalone: true,
  imports: [StatusChipComponent],
  template: `<app-status-chip [icon]="icon()" [label]="label()" [chipClass]="chipClass()" [iconClass]="iconClass()" />`,
})
export class CsvContentTypeChipComponent {
  type = input.required<CsvContentType>();

  private readonly styleByType = {
    [CsvContentType.HYDROGEN]: {
      chipClass: 'border-primary-100 bg-primary-100/60 text-primary-700',
      iconClass: 'text-primary-700',
    },
    [CsvContentType.POWER]: {
      chipClass: 'border-secondary-100 bg-secondary-100/60 text-secondary-700',
      iconClass: 'text-secondary-700',
    },
  };

  icon = computed(() => {
    return this.type() === CsvContentType.HYDROGEN ? ICONS.UNITS.HYDROGEN_PRODUCTION : ICONS.UNITS.POWER_PRODUCTION;
  });

  label = computed(() => {
    return this.type() === CsvContentType.HYDROGEN ? 'Hydrogen Production' : 'Power Production';
  });

  chipClass = computed(() => {
    return this.styleByType[this.type()].chipClass;
  });

  iconClass = computed(() => {
    return this.styleByType[this.type()].iconClass;
  });
}
