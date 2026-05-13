/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../../layout/error-card/error-card.component';
import { InfoTooltipComponent } from '../../../../layout/info-tooltip/info-tooltip.component';
import { LoadingCardComponent } from '../../../../layout/loading-card/loading-card.component';
import { RFNBO_CRITERIA } from '../../../../shared/constants/rfnbo-criteria';
import { BoolPipe } from '../../../../shared/pipes/bool-pipe';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { QueryKeyPrefix } from '../../../../shared/queries/shared-query-keys';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UnitActionsComponent } from '../shared/unit-actions/unit-actions.component';
import { UnitDetailsComponent } from '../shared/unit-details/unit-details.component';

@Component({
  selector: 'app-power-production-details',
  imports: [
    CommonModule,
    UnitPipe,
    BoolPipe,
    InfoTooltipComponent,
    UnitDetailsComponent,
    RouterModule,
    ErrorCardComponent,
    LoadingCardComponent,
    MatButtonModule,
    UnitActionsComponent,
    EnumPipe,
  ],
  templateUrl: './power-production-details.component.html',
})
export class PowerProductionDetailsComponent {
  protected readonly RFNBO_CRITERIA = RFNBO_CRITERIA;
  protected readonly MeasurementUnit = MeasurementUnit;

  id = input<string>();

  private unitsService = inject(UnitsService);
  private queryClient = inject(QueryClient);

  unitQuery = injectQuery(() => ({
    queryKey: [QueryKeyPrefix.POWER_PRODUCTION_UNITS, this.id()],
    queryFn: () => this.unitsService.getPowerProductionUnit(this.id() ?? ''),
  }));

  onUnitStatusChange = () => this.queryClient.invalidateQueries({ queryKey: [QueryKeyPrefix.POWER_PRODUCTION_UNITS] });
}
