import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { PowerBatchDto } from '@h2-trust/api';
import { BaseSheetComponent } from '../../../../../../layout/sheet/sheet.component';
import { VerifiedChartComponent } from '../../../../../../layout/verified-chart/verified-chart.component';
import { BatchEmissionsComponent } from '../batch-emissions/batch-emissions.component';

@Component({
  selector: 'app-power-batch-card',
  imports: [CommonModule, BaseSheetComponent, VerifiedChartComponent, BatchEmissionsComponent],
  templateUrl: './power-batch-card.component.html',
})
export class PowerBatchCardComponent {
  batch = input.required<PowerBatchDto>();
}
