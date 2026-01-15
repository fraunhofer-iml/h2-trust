/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { ERROR_MESSAGES } from '../../../shared/constants/error.messages';
import { FormattedUnits } from '../../../shared/constants/formatted-units';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { H2CompositionChartComponent } from './chart/h2-composition-chart.component';
import { ProofOfOriginComponent } from './proof-of-origin/proof-of-origin.component';
import { ProofOfSustainabilityComponent } from './proof-of-sustainability/proof-of-sustainability.component';
import { RedComplianceComponent } from './red-compliance/red-compliance.component';

@Component({
  selector: 'app-product-pass',
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    H2CompositionChartComponent,
    ProofOfOriginComponent,
    ErrorCardComponent,
    ProofOfSustainabilityComponent,
    UnitPipe,
    RedComplianceComponent,
  ],
  templateUrl: './product-pass.component.html',
})
export class ProductPassComponent {
  bottlingService = inject(BottlingService);
  authService = inject(AuthService);

  selectedUrl = '';
  isAuthenticated = false;

  id = input<string>('');

  readonly ERROR_MESSAGES = ERROR_MESSAGES;
  readonly FormattedUnits = FormattedUnits;

  batchQuery = injectQuery(() => ({
    queryKey: ['batch', this.id()],
    queryFn: () => this.bottlingService.findBatchById(this.id() ?? ''),
    enabled: !!this.id(),
  }));

  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  openFile(url: string) {
    window.open(url, '_blank');
  }
}
