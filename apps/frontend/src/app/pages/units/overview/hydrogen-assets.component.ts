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
import { MatChipSelectionChange, MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit, UnitType } from '@h2-trust/domain';
import { UnitCardComponent } from '../../../layout/unit-card/unit-card.component';
import { PrettyEnumPipe } from '../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../shared/pipes/unit.pipe';
import { UnitsService } from '../../../shared/services/units/units.service';
import { HydrogenProductionUnitsStore } from '../../../shared/store/hydrogen-production-units.store';

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
    UnitCardComponent,
    MatSlideToggleModule,
  ],
  providers: [],
  templateUrl: './hydrogen-assets.component.html',
})
export class HydrogenAssetsComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly UnitType = UnitType;

  protected readonly unitsService = inject(UnitsService);
  protected readonly state = inject(HydrogenProductionUnitsStore);

  typeToShow: UnitType | null = null;
  showActive: boolean | null = null;

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  powerProductionQuery = injectQuery(() => ({
    queryKey: ['power-production'],
    queryFn: async () => this.unitsService.getPowerProductionUnits(),
  }));

  hydrogenProductionUnits$ = this.state.hydrogenProductionUnits$;

  ngOnInit() {
    this.state.loadUnits();
  }

  toggle(unitType: UnitType | null) {
    if (this.typeToShow === unitType) {
      this.typeToShow = null;
    } else this.typeToShow = unitType;
  }

  toggleStatus(active: boolean | null) {
    if (this.showActive === active) {
      this.showActive = null;
    } else this.showActive = active;
  }

  onAllChipSelection(event: MatChipSelectionChange) {
    if (!event.selected && !this.typeToShow) {
      event.source.select();
    }
  }
}
