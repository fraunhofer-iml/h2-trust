/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormattedUnits } from 'apps/frontend/src/app/shared/constants/formatted-units';
import { UnitPipe } from 'apps/frontend/src/app/shared/pipes/unit.pipe';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { BatchDto, BatchType, HydrogenBatchDto, PowerBatchDto, WaterBatchDto } from '@h2-trust/api';
import { H2BatchCardComponent } from './h2-batch-card/h2-batch-card.component';
import { PowerBatchCardComponent } from './power-batch-card/power-batch-card.component';
import { WaterBatchCardComponent } from './water-batch-card/water-batch-card.component';

@Component({
  selector: 'app-batch-card',
  imports: [CommonModule, WaterBatchCardComponent, H2BatchCardComponent, PowerBatchCardComponent, UnitPipe],
  templateUrl: './batch-card.component.html',
})
export class BatchCardComponent {
  batch = input.required<BatchDto>();

  protected readonly FormattedUnits = FormattedUnits;

  isInstanceOfWaterBatch(batch: BatchDto): WaterBatchDto | null {
    return batch.batchType === BatchType.WATER ? (batch as WaterBatchDto) : null;
  }
  isInstanceOfHydrogenBatch(batch: BatchDto): HydrogenBatchDto | null {
    return batch.batchType === BatchType.HYDROGEN ? (batch as HydrogenBatchDto) : null;
  }
  isInstanceOfPowerBatch(batch: BatchDto): PowerBatchDto | null {
    return batch.batchType === BatchType.POWER ? (batch as PowerBatchDto) : null;
  }
}
