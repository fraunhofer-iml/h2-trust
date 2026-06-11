/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit, UnitType } from '@h2-trust/domain';
import { EmptyStateComponent } from '../../../layout/empty-state/empty-state.component';
import { UnitCardComponent } from '../../../layout/unit-card/unit-card.component';
import { EnumPipe } from '../../../shared/pipes/enum.pipe';
import { unitsQueryOptions } from '../../../shared/queries/units.query';
import { UnitsService } from '../../../shared/services/units/units.service';

@Component({
  selector: 'app-hydrogen-assets',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatChipsModule,
    EnumPipe,
    MatDividerModule,
    UnitCardComponent,
    EmptyStateComponent,
  ],
  providers: [],
  templateUrl: './hydrogen-assets.component.html',
})
export class HydrogenAssetsComponent {
  protected readonly MeasurementUnit = MeasurementUnit;
  protected readonly UnitType = UnitType;
  protected readonly unitTypes = Object.values(UnitType);
  protected readonly unitsService = inject(UnitsService);

  typeToShow = signal<UnitType | undefined>(undefined);

  unitsQuery = injectQuery(() => unitsQueryOptions(this.unitsService, this.typeToShow()));

  selectType(unitType: UnitType) {
    if (this.typeToShow() === unitType) {
      this.typeToShow.set(undefined);
      return;
    }

    this.typeToShow.set(unitType);
  }

  showAll() {
    this.typeToShow.set(undefined);
  }
}
