/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../../layout/error-card/error-card.component';
import { LoadingCardComponent } from '../../../../layout/loading-card/loading-card.component';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { QueryKeyPrefix } from '../../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { toastQueryError } from '../../../../shared/util/query-error-handler';
import { UnitActionsComponent } from '../shared/unit-actions/unit-actions.component';
import { UnitDetailsComponent } from '../shared/unit-details/unit-details.component';

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

  unitQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.HYDROGEN_STORAGE_UNITS, this.id()],
    queryFn: () => this.unitsService.getHydrogenStorageUnit(this.id() ?? ''),
    onError: (e: HttpErrorResponse) => toastQueryError(e),
  }));

  onUnitStatusChange = () => this.queryClient.invalidateQueries({ queryKey: [QueryKeyPrefix.HYDROGEN_STORAGE_UNITS] });
}
