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
import { QueryClient } from '@tanstack/angular-query-experimental';
import { PowerProductionUnitDto } from '@h2-trust/contracts/dtos';
import { MeasurementUnit, UnitType } from '@h2-trust/domain';
import { ErrorCardComponent } from '../../../../layout/error-card/error-card.component';
import { InfoTooltipComponent } from '../../../../layout/info-tooltip/info-tooltip.component';
import { LoadingCardComponent } from '../../../../layout/loading-card/loading-card.component';
import { RFNBO_CRITERIA } from '../../../../shared/constants/rfnbo-criteria';
import { BoolPipe } from '../../../../shared/pipes/bool-pipe';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { UnitsService } from '../../../../shared/services/units/units.service';
import { UnitActionsComponent } from '../shared/unit-actions/unit-actions.component';
import { UnitDetailsComponent } from '../shared/unit-details/unit-details.component';
import { injectUnitQuery, useQueryInvalidation } from '../shared/unit-query.util';

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
    PrettyEnumPipe,
  ],
  templateUrl: './power-production-details.component.html',
})
export class PowerProductionDetailsComponent {
  protected readonly RFNBO_CRITERIA = RFNBO_CRITERIA;
  protected readonly MeasurementUnit = MeasurementUnit;

  id = input<string>();

  private unitsService = inject(UnitsService);
  private queryClient = inject(QueryClient);

  unitQuery = injectUnitQuery<PowerProductionUnitDto>(UnitType.POWER_PRODUCTION, this.id, (id) =>
    this.unitsService.getPowerProductionUnit(id),
  );

  onUnitStatusChange = useQueryInvalidation(this.queryClient, UnitType.POWER_PRODUCTION, this.id);
}
