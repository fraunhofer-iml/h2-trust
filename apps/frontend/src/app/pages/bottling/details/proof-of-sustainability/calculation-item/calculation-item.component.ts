/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ICONS } from 'apps/frontend/src/app/shared/constants/icons';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { EmissionCalculationDto } from '@h2-trust/api';
import { CalculationTopic } from '@h2-trust/domain';
import { BaseSheetComponent } from '../../../../../layout/sheet/sheet.component';
import { PrettyEnumPipe } from '../../../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../../../shared/pipes/unit.pipe';
import { FormattedUnits } from '../../../../../shared/constants/formatted-units';

@Component({
  selector: 'app-calculation-item',
  imports: [CommonModule, PrettyEnumPipe, MatExpansionModule, BaseSheetComponent, UnitPipe],
  templateUrl: './calculation-item.component.html',
})
export class CalculationItemComponent {
  topic = input.required<{
    key: string;
    items: EmissionCalculationDto[];
  }>();

  closed = true;
  FormattedUnits = FormattedUnits;

  getIcon(topic: string) {
    const map = new Map<string, string>([
      [CalculationTopic.HYDROGEN_STORAGE, ICONS.PROCESS_STEPS.HYDROGEN_STORAGE],
      [CalculationTopic.WATER_SUPPLY, ICONS.PROCESS_STEPS.WATER_SUPPLY],
      [CalculationTopic.HYDROGEN_TRANSPORTATION, ICONS.PROCESS_STEPS.TRANSPORTATION],
      [CalculationTopic.POWER_SUPPLY, ICONS.PROCESS_STEPS.POWER_SUPPLY],
      [CalculationTopic.HYDROGEN_BOTTLING, ICONS.PROCESS_STEPS.HYDROGEN_BOTTLING],
    ]);

    return map.get(topic);
  }
  reduceAmount(items: EmissionCalculationDto[]): number {
    return items.reduce((acc, curr) => acc + curr.result, 0);
  }
}
