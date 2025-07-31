import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { WaterBatchDto } from '@h2-trust/api';
import { VerifiedChartComponent } from '../../../../../..//layout/verified-chart/verified-chart.component';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';

@Component({
  selector: 'app-water-batch-card',
  imports: [CommonModule, BaseSheetComponent, VerifiedChartComponent],
  templateUrl: './water-batch-card.component.html',
})
export class WaterBatchCardComponent {
  batch = input.required<WaterBatchDto>();
}
