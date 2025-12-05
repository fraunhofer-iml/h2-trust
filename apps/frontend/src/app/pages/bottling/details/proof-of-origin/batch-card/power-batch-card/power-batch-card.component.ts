/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormattedUnits } from 'apps/frontend/src/app/shared/constants/formatted-units';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { PowerBatchDto } from '@h2-trust/api';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';
import { VerifiedChartComponent } from '../../../../../../layout/verified-chart/verified-chart.component';
import { UnitPipe } from '../../../../../../shared/pipes/unit.pipe';
import { BatchEmissionsComponent } from '../batch-emissions/batch-emissions.component';

@Component({
  selector: 'app-power-batch-card',
  imports: [CommonModule, BaseSheetComponent, VerifiedChartComponent, BatchEmissionsComponent, UnitPipe],
  templateUrl: './power-batch-card.component.html',
})
export class PowerBatchCardComponent {
  protected readonly FormattedUnits = FormattedUnits;
  batch = input.required<PowerBatchDto>();
}
