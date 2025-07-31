import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { BatchDto, BatchType, HydrogenBatchDto, PowerBatchDto, WaterBatchDto } from '@h2-trust/api';
import { H2BatchCardComponent } from './h2-batch-card/h2-batch-card.component';
import { PowerBatchCardComponent } from './power-batch-card/power-batch-card.component';
import { WaterBatchCardComponent } from './water-batch-card/water-batch-card.component';

@Component({
  selector: 'app-batch-card',
  imports: [CommonModule, WaterBatchCardComponent, H2BatchCardComponent, PowerBatchCardComponent],
  templateUrl: './batch-card.component.html',
})
export class BatchCardComponent {
  batch = input.required<BatchDto>();

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
