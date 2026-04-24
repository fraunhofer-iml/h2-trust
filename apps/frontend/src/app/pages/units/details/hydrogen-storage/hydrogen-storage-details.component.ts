/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { HydrogenStorageUnitDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit, UnitType } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../../layout/error-card/error-card.component';
import { LoadingCardComponent } from '../../../../layout/loading-card/loading-card.component';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UnitActionsComponent } from '../shared/unit-actions/unit-actions.component';
import { UnitDetailsComponent } from '../shared/unit-details/unit-details.component';
import { injectUnitQuery, useQueryInvalidation } from '../shared/unit-query.util';

@Component({
  selector: 'app-hydrogen-storage-details',
  imports: [
    UnitPipe,
    UnitDetailsComponent,
    RouterModule,
    ErrorCardComponent,
    LoadingCardComponent,
    UnitActionsComponent,
    CommonModule,
    EnumPipe,
  ],
  templateUrl: './hydrogen-storage-details.component.html',
})
export class HydrogenStorageDetailsComponent {
  readonly MeasurementUnit = MeasurementUnit;

  id = input<string>();

  unitsService = inject(UnitsService);
  private queryClient = inject(QueryClient);

  unitQuery = injectUnitQuery<HydrogenStorageUnitDto>(UnitType.HYDROGEN_STORAGE, this.id, (id) =>
    this.unitsService.getHydrogenStorageUnit(id),
  );

  onUnitStatusChange = useQueryInvalidation(this.queryClient, UnitType.HYDROGEN_STORAGE, this.id);
}
