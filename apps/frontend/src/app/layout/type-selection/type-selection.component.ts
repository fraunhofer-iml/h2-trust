/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CsvContentType, RfnboType, UnitType } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';

type SelectableType = UnitType | CsvContentType | RfnboType;

@Component({
  selector: 'app-type-selection',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './type-selection.component.html',
})
export class TypeSelectionComponent {
  types = input.required<readonly SelectableType[]>();
  typeControl = input.required<FormControl<SelectableType | null | undefined>>();
  descriptions = input<Record<string, string>>({});
  disabledTypes = input<readonly SelectableType[]>([]);

  private readonly iconMap: Record<string, string> = {
    [UnitType.HYDROGEN_PRODUCTION]: ICONS.UNITS.HYDROGEN_PRODUCTION,
    [UnitType.POWER_PRODUCTION]: ICONS.UNITS.POWER_PRODUCTION,
    [UnitType.HYDROGEN_STORAGE]: ICONS.UNITS.HYDROGEN_STORAGE,
    [CsvContentType.HYDROGEN]: ICONS.UNITS.HYDROGEN_PRODUCTION,
    [CsvContentType.POWER]: ICONS.UNITS.POWER_PRODUCTION,
    [RfnboType.RFNBO_READY]: ICONS.HYDROGEN.RFNBO_READY,
    [RfnboType.NON_CERTIFIABLE]: ICONS.HYDROGEN.NON_CERTIFIABLE,
  };
  private readonly labelMap: Record<string, string> = {
    [UnitType.HYDROGEN_PRODUCTION]: 'Hydrogen production',
    [UnitType.POWER_PRODUCTION]: 'Power production',
    [UnitType.HYDROGEN_STORAGE]: 'Hydrogen storage',
    [CsvContentType.HYDROGEN]: 'Hydrogen production data',
    [CsvContentType.POWER]: 'Power production data',
    [RfnboType.RFNBO_READY]: 'RFNBO Ready',
    [RfnboType.NON_CERTIFIABLE]: 'Non certifiable',
  };

  selectType(type: SelectableType) {
    if (this.isDisabled(type)) return;

    this.typeControl().setValue(type);
    this.typeControl().markAsTouched();
  }

  getIcon(type: SelectableType) {
    return this.iconMap[type] ?? '';
  }

  getLabel(type: SelectableType) {
    return this.labelMap[type] ?? '';
  }

  getDescription(type: SelectableType) {
    return this.descriptions()[type] ?? '';
  }

  isDisabled(type: SelectableType) {
    return this.disabledTypes().includes(type);
  }

  isSelected(type: SelectableType) {
    return this.typeControl().value === type;
  }
}
