/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { UnitsService } from '../../shared/services/units/units.service';
import { HydrogenProductionTableComponent } from './tables/hydrogen-production-table/hydrogen-production-table.component';
import { HydrogenStorageTableComponent } from './tables/hydrogen-storage-table/hydrogen-storage-table.component';
import { PowerProductionTableComponent } from './tables/power-production-table/power-production-table.component';

@Component({
  selector: 'app-hydrogen-assets',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    HydrogenProductionTableComponent,
    HydrogenStorageTableComponent,
    PowerProductionTableComponent,
    RouterModule,
    MatButtonModule,
  ],
  providers: [],
  templateUrl: './hydrogen-assets.component.html',
})
export class HydrogenAssetsComponent {
  unitsService = inject(UnitsService);

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  powerProductionQuery = injectQuery(() => ({
    queryKey: ['power-production'],
    queryFn: async () => this.unitsService.getPowerProductionUnits(),
  }));

  hydrogenProductionQuery = injectQuery(() => ({
    queryKey: ['h2-production'],
    queryFn: async () => this.unitsService.getHydrogenProductionUnits(),
  }));
}
