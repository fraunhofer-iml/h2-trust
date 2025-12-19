/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { UnitType } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-unit-type-chip',
  imports: [CommonModule, PrettyEnumPipe],
  templateUrl: './unit-type-chip.component.html',
})
export class UnitTypeChipComponent {
  protected readonly ICONS = ICONS.UNITS;
  unitType = input.required<UnitType>();

  getIcon() {
    switch (this.unitType()) {
      case UnitType.HYDROGEN_PRODUCTION:
        return this.ICONS.HYDROGEN_PRODUCTION;
      case UnitType.POWER_PRODUCTION:
        return this.ICONS.POWER_PRODUCTION;
      case UnitType.HYDROGEN_STORAGE:
        return this.ICONS.HYDROGEN_STORAGE;
    }
  }
}
