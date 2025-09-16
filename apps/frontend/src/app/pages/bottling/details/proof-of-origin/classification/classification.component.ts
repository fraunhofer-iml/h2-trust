/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { ClassificationDto } from '@h2-trust/api';
import { VerifiedChartComponent } from '../../../../../layout/verified-chart/verified-chart.component';
import { PrettyEnumPipe } from '../../../../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-classification',
  imports: [CommonModule, VerifiedChartComponent, PrettyEnumPipe],
  templateUrl: './classification.component.html',
})
export class ClassificationComponent {
  classification = input.required<ClassificationDto>();

  getIcon(key: string): string {
    switch (key) {
      case 'HYDROGEN':
        return 'bubble_chart';
      case 'POWER':
        return 'charger';
      case 'WATER':
        return 'water_drop';
      default:
        return '';
    }
  }
}
