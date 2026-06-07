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
import { MeasurementUnit } from '@h2-trust/domain';
import { EmptyStateComponent } from '../../../layout/empty-state/empty-state.component';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { LoadingCardComponent } from '../../../layout/loading-card/loading-card.component';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { QueryKeyPrefix } from '../../../shared/queries/shared-query-keys';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { H2CompositionChartComponent } from './chart/h2-composition-chart.component';
import { ProofOfOriginComponent } from './proof-of-origin/proof-of-origin.component';
import { ProofOfSustainabilityComponent } from './proof-of-sustainability/proof-of-sustainability.component';
import { RfnboComplianceComponent } from './rfnbo-compliance/rfnbo-compliance.component';
import { H2TrustRoutes } from '../../../shared/constants/routes';

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
    RfnboComplianceComponent,
    LoadingCardComponent,
    EmptyStateComponent,
    EnumPipe,
  ],
  templateUrl: './product-pass.component.html',
})
export class ProductPassComponent {
  protected readonly H2TrustRoutes = H2TrustRoutes;
  bottlingService = inject(BottlingService);
  authService = inject(AuthService);

  selectedUrl = '';
  isAuthenticated = false;

  id = input<string>('');

  readonly MeasurementUnit = MeasurementUnit;

  batchQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.BOTTLING, this.id()],
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
