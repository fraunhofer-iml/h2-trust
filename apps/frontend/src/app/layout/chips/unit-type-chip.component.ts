/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { UnitType } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';

@Component({
  selector: 'app-unit-type-chip',
  imports: [CommonModule, MatChipsModule, EnumPipe],
  template: `<div
    class="flex w-fit min-w-40 flex-row items-center gap-2 rounded-lg border px-2 text-sm"
    [ngClass]="{
      'border-primary-400 text-primary-500': unitType() === UnitType.POWER_PRODUCTION,
      'border-secondary-400 text-secondary-500': unitType() === UnitType.HYDROGEN_PRODUCTION,
      'border-tertiary-200 text-tertiary-500': unitType() === UnitType.HYDROGEN_STORAGE,
    }"
  >
    <span
      class="material-symbols-outlined text-lg"
      [ngClass]="{
        'text-primary-400': unitType() === UnitType.POWER_PRODUCTION,
        'text-secondary-400': unitType() === UnitType.HYDROGEN_PRODUCTION,
        'text-tertiary-400': unitType() === UnitType.HYDROGEN_STORAGE,
      }"
    >
      {{ getIcon() }}
    </span>
    {{ unitType() | enum: 'unitType' }}
  </div>`,
})
export class UnitTypeChipComponent {
  protected readonly UnitType = UnitType;
  unitType = input.required<UnitType>();

  getIcon() {
    const unitType = this.unitType();
    return ICONS.UNITS[unitType];
  }
}
