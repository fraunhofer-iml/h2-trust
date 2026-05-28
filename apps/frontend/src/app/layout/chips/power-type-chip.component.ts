/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { PowerType } from '@h2-trust/domain';
import { getPowerTypeIcon } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-power-type-chip',
  imports: [StatusChipComponent, EnumPipe],
  template: `<app-status-chip [icon]="icon()" [label]="powerType() | enum: 'powerType'" [chipClass]="chipClass()" />`,
})
export class PowerTypeChipComponent {
  powerType = input.required<PowerType>();

  private readonly chipClassByPowerType = {
    [PowerType.NOT_SPECIFIED]: 'border-neutral-300 bg-neutral-100 text-neutral-600',
    [PowerType.NON_RENEWABLE]: 'border-neutral-300 bg-neutral-100 text-neutral-600',
    [PowerType.PARTLY_RENEWABLE]:
      'bg-gradient-to-r from-neutral-100 to-secondary-100 text-neutral-700 border-r-secondary-100 border-neutral-200',
    [PowerType.RENEWABLE]: 'border-secondary-100 bg-secondary-100/60 text-secondary-700',
  };

  icon = computed(() => {
    return getPowerTypeIcon(this.powerType());
  });

  chipClass = computed(() => {
    return this.chipClassByPowerType[this.powerType()];
  });
}
