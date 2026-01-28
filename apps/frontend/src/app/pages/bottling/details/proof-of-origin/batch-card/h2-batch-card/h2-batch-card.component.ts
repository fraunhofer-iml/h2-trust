/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginCardComponent } from 'apps/frontend/src/app/layout/proof-of-origin-card/proof-of-origin-card.component';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { HydrogenBatchDto } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';
import { H2ColorChipComponent } from '../../../../../../layout/h2-color-chip/h2-color-chip.component';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';
import { PrettyEnumPipe } from '../../../../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../../../../shared/pipes/unit.pipe';
import { H2CompositionChartComponent } from '../../../chart/h2-composition-chart.component';
import { BatchEmissionsComponent } from '../batch-emissions/batch-emissions.component';

@Component({
  selector: 'app-h2-batch-card',
  imports: [
    CommonModule,
    BaseSheetComponent,
    H2ColorChipComponent,
    H2CompositionChartComponent,
    PrettyEnumPipe,
    BatchEmissionsComponent,
    UnitPipe,
    ProofOfOriginCardComponent,
  ],
  templateUrl: './h2-batch-card.component.html',
})
export class H2BatchCardComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  batch = input.required<HydrogenBatchDto>();
}
