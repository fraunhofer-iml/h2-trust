/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { UnitPipe } from '../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-verified-chart',
  imports: [CommonModule, UnitPipe],
  templateUrl: './verified-chart.component.html',
})
export class VerifiedChartComponent {
  amount = input<number>(0);
  verifiedAmount = input<number | undefined>();
  unit = input.required<string>();

  percentage$ = computed(() => {
    const verified = this.verifiedAmount();
    if (!verified && verified !== 0) return 100;
    return ((verified * 100) / this.amount()).toFixed(0);
  });
}
