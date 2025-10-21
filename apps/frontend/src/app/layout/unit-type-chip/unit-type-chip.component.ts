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
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-unit-type-chip',
  imports: [CommonModule, PrettyEnumPipe],
  templateUrl: './unit-type-chip.component.html',
})
export class UnitTypeChipComponent {
  unitType = input<string>('');

  getIcon() {
    switch (this.unitType()) {
      case UnitType.HYDROGEN_PRODUCTION:
        return 'settings';
      case UnitType.POWER_PRODUCTION:
        return 'electric_bolt';
      case UnitType.HYDROGEN_STORAGE:
        return 'propane';
      default:
        return 'block';
    }
  }
}
