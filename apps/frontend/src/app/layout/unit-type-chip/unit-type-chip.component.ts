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
  imports: [CommonModule, EnumPipe, MatChipsModule],
  templateUrl: './unit-type-chip.component.html',
})
export class UnitTypeChipComponent {
  protected readonly UnitType = UnitType;
  unitType = input.required<UnitType>();

  getIcon() {
    const unitType = this.unitType();
    return ICONS.UNITS[unitType];
  }
}
