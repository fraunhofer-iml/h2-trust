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
import { EmissionCalculationDto } from '@h2-trust/contracts/dtos';
import { CalculationTopic, MeasurementUnit } from '@h2-trust/domain';
import { BaseSheetComponent } from '../../../../../layout/sheet/sheet.component';
import { getCalculationTopicIcon } from '../../../../../shared/constants/icons';
import { EnumPipe } from '../../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-calculation-item',
  imports: [CommonModule, MatExpansionModule, BaseSheetComponent, UnitPipe, EnumPipe],
  templateUrl: './calculation-item.component.html',
})
export class CalculationItemComponent {
  topic = input.required<{
    key: CalculationTopic;
    items: EmissionCalculationDto[];
  }>();

  closed = true;
  MeasurementUnit = MeasurementUnit;

  getIcon(topic: string) {
    return getCalculationTopicIcon(topic as CalculationTopic);
  }

  reduceAmount(items: EmissionCalculationDto[]): number {
    return items.reduce((acc, curr) => acc + curr.result, 0);
  }
}
