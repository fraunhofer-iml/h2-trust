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
import { WaterBatchDto } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';
import { UnitPipe } from '../../../../../../shared/pipes/unit.pipe';
import { BatchEmissionsComponent } from '../batch-emissions/batch-emissions.component';

@Component({
  selector: 'app-water-batch-card',
  imports: [CommonModule, BaseSheetComponent, BatchEmissionsComponent, UnitPipe, ProofOfOriginCardComponent],
  templateUrl: './water-batch-card.component.html',
})
export class WaterBatchCardComponent {
  batch = input.required<WaterBatchDto>();

  readonly MeasurementUnit = MeasurementUnit;
}
