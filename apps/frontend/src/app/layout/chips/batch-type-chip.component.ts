/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { UnitType } from '@h2-trust/domain';
import { getUnitIcon } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-ppa-status-chip',
  imports: [StatusChipComponent, EnumPipe],
  template: `<app-status-chip
    [icon]="icon()"
    [label]="type() | enum: 'unitType'"
    chipClass="border-primary-100 bg-primary-100/60 text-primary-700"
    iconClass="text-primary-700"
  />`,
})
export class BatchTypeChipComponent {
  type = input.required<UnitType>();

  icon = computed(() => {
    return getUnitIcon(this.type());
  });
}
