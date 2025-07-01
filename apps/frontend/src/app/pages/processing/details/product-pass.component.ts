import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProcessingService } from '../../../shared/services/processing/processing.service';
import { H2CompositionChartComponent } from './chart/h2-composition-chart.component';

@Component({
  selector: 'app-product-pass',
  imports: [CommonModule, MatIconModule, RouterModule, H2CompositionChartComponent],
  templateUrl: './product-pass.component.html',
})
export class ProductPassComponent {
  constructor(private readonly processingService: ProcessingService) {}

  id = input<string>('');

  batchQuery = injectQuery(() => ({
    queryKey: ['batch', this.id()],
    queryFn: () => this.processingService.findBatchById(this.id() ?? ''),
    enabled: !!this.id(),
  }));
}
