import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { BaseSheetComponent } from '../../../layout/sheet/sheet.component';
import { ERROR_MESSAGES } from '../../../shared/constants/error.messages';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { H2CompositionChartComponent } from './chart/h2-composition-chart.component';
import { FileSheetComponent } from './file-sheet/file-sheet.component';
import { ProofOfOriginComponent } from './proof-of-origin/proof-of-origin.component';
import { ProofOfSustainabilityComponent } from './proof-of-sustainability/proof-of-sustainability.component';

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
    ErrorCardComponent,
    ProofOfSustainabilityComponent,
  ],
  templateUrl: './product-pass.component.html',
})
export class ProductPassComponent {
  bottlingService = inject(BottlingService);
  authService = inject(AuthService);

  selectedUrl = '';
  isAuthenticated = false;

  id = input<string>('');

  ERROR_MESSAGES = ERROR_MESSAGES;

  batchQuery = injectQuery(() => ({
    queryKey: ['batch', this.id()],
    queryFn: () => this.bottlingService.findBatchById(this.id() ?? ''),
    enabled: !!this.id(),
  }));

  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }
}
