/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { WaterBatchDto } from '@h2-trust/api';
import { VerifiedChartComponent } from '../../../../../..//layout/verified-chart/verified-chart.component';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';
import { BatchEmissionsComponent } from '../batch-emissions/batch-emissions.component';

@Component({
  selector: 'app-water-batch-card',
  imports: [CommonModule, BaseSheetComponent, VerifiedChartComponent, BatchEmissionsComponent],
  templateUrl: './water-batch-card.component.html',
})
export class WaterBatchCardComponent {
  batch = input.required<WaterBatchDto>();
}
