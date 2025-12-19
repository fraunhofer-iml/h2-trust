/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormattedUnits } from 'apps/frontend/src/app/shared/constants/formatted-units';
import { ICONS } from 'apps/frontend/src/app/shared/constants/icons';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ClassificationDto } from '@h2-trust/api';
import { BatchType } from '@h2-trust/domain';
import { VerifiedChartComponent } from '../../../../../layout/verified-chart/verified-chart.component';
import { PrettyEnumPipe } from '../../../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-classification',
  imports: [CommonModule, VerifiedChartComponent, PrettyEnumPipe, UnitPipe],
  templateUrl: './classification.component.html',
})
export class ClassificationComponent {
  classification = input.required<ClassificationDto>();

  protected readonly FormattedUnits = FormattedUnits;

  getIcon(key: string): string {
    switch (key) {
      case BatchType.HYDROGEN:
        return ICONS.PROCESS_STEPS.HYDROGEN_STORAGE;
      case BatchType.POWER:
        return ICONS.PROCESS_STEPS.POWER_SUPPLY;
      case BatchType.WATER:
        return ICONS.PROCESS_STEPS.WATER_SUPPLY;
      default:
        return '';
    }
  }
}
