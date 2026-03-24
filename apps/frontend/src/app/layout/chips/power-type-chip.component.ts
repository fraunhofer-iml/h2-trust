/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { PowerType } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-power-type-chip',
  imports: [CommonModule, PrettyEnumPipe],
  template: `<div
    class="flex w-fit flex-row items-center gap-2 rounded-lg border border-neutral-200 pl-2 pr-4"
    [ngClass]="chipColor"
  >
    <span class="material-symbols-outlined text-lg"> {{ icon() }} </span>
    {{ this.powerType() | prettyEnum | titlecase }}
  </div>`,
})
export class PowerTypeChipComponent {
  powerType = input.required<PowerType>();

  icon = computed(() => {
    const type = this.powerType();

    switch (type) {
      case PowerType.NOT_SPECIFIED:
        return ICONS.POWER.NON_RENEWABLE;
      case PowerType.NON_RENEWABLE:
        return ICONS.POWER.NON_RENEWABLE;
      case PowerType.PARTLY_RENEWABLE:
        return ICONS.POWER.PARTLY_RENEWABLE;
      case PowerType.RENEWABLE:
        return ICONS.POWER.RENEWABLE;
    }
  });

  private readonly chipColorByPowerType = {
    [PowerType.NOT_SPECIFIED]: 'text-neutral-700 bg-neutral-100 ',
    [PowerType.NON_RENEWABLE]: 'text-neutral-700 bg-neutral-100 ',
    [PowerType.PARTLY_RENEWABLE]:
      'bg-gradient-to-r from-neutral-100 to-secondary-100 text-neutral-700 border-r-secondary-100 ',
    [PowerType.RENEWABLE]: 'bg-secondary-100/60 text-secondary-700 border-secondary-100 ',
  };

  get chipColor(): string | undefined {
    return this.chipColorByPowerType[this.powerType()];
  }
}
