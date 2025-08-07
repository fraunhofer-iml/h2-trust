import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { BaseSheetComponent } from '../../../layout/sheet/sheet.component';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { H2CompositionChartComponent } from './chart/h2-composition-chart.component';
import { FileSheetComponent } from './file-sheet/file-sheet.component';
import { ProofOfOriginComponent } from './proof-of-origin/proof-of-origin.component';

@Component({
  selector: 'app-product-pass',
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    H2CompositionChartComponent,
    ProofOfOriginComponent,
    BaseSheetComponent,
    FileSheetComponent,
  ],
  templateUrl: './product-pass.component.html',
})
export class ProductPassComponent {
  bottlingService = inject(BottlingService);

  selectedUrl = '';

  id = input<string>('');

  batchQuery = injectQuery(() => ({
    queryKey: ['batch', this.id()],
    queryFn: () => this.bottlingService.findBatchById(this.id() ?? ''),
    enabled: !!this.id(),
  }));
}
