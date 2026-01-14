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
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { UnitType } from '@h2-trust/domain';
import { FormattedUnits } from '../../shared/constants/formatted-units';
import { ICONS } from '../../shared/constants/icons';
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../shared/pipes/unit.pipe';
import { UnitsService } from '../../shared/services/units/units.service';

@Component({
  selector: 'app-hydrogen-assets',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatTabsModule,
    RouterModule,
    MatButtonModule,
    UnitPipe,
    MatChipsModule,
    PrettyEnumPipe,
    MatDividerModule,
  ],
  providers: [],
  templateUrl: './hydrogen-assets.component.html',
})
export class HydrogenAssetsComponent {
  protected readonly ICONS = ICONS;
  protected readonly FormattedUnits = FormattedUnits;
  protected readonly UnitType = UnitType;

  protected readonly unitsService = inject(UnitsService);

  showPowerProduction = true;
  showHydrogenProduction = true;
  showHydrogenStorage = true;

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

  toggle(type: UnitType) {
    switch (type) {
      case UnitType.HYDROGEN_PRODUCTION:
        this.showHydrogenProduction = !this.showHydrogenProduction;
        break;
      case UnitType.POWER_PRODUCTION:
        this.showPowerProduction = !this.showPowerProduction;
        break;
      case UnitType.HYDROGEN_STORAGE:
        this.showHydrogenStorage = !this.showHydrogenStorage;
        break;
    }
  }
}
