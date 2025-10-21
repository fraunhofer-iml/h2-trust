/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { EmissionCalculationDto } from '@h2-trust/api';
import { CalculationTopic } from '@h2-trust/domain';
import { BaseSheetComponent } from '../../../../../layout/sheet/sheet.component';
import { PrettyEnumPipe } from '../../../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../../../shared/pipes/unit.pipe';

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

  getIcon(topic: string) {
    const map = new Map<string, string>([
      [CalculationTopic.HYDROGEN_BOTTLING, 'propane_tank'],
      [CalculationTopic.WATER_SUPPLY, 'water'],
      [CalculationTopic.POWER_PRODUCTION, 'offline_bolt'],
      [CalculationTopic.TRANSPORT, 'road'],
    ]);

    return map.get(topic);
  }
  reduceAmount(items: EmissionCalculationDto[]): number {
    return items.reduce((acc, curr) => acc + curr.result, 0);
  }
}
