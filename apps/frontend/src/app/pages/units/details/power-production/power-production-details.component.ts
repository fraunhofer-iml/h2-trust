/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCardComponent } from 'apps/frontend/src/app/layout/error-card/error-card.component';
import { InfoTooltipComponent } from 'apps/frontend/src/app/layout/info-tooltip/info-tooltip.component';
import { ERROR_MESSAGES } from 'apps/frontend/src/app/shared/constants/error.messages';
import { RFNBO_CRITERIA } from 'apps/frontend/src/app/shared/constants/rfnbo-criteria';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { MeasurementUnit } from '@h2-trust/domain';
import { BoolPipe } from '../../../../shared/pipes/bool-pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { UnitDetailsComponent } from '../unit-details.component';

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
  ],
  templateUrl: './power-production-details.component.html',
})
export class PowerProductionDetailsComponent {
  protected readonly RFNBO_CRITERIA = RFNBO_CRITERIA;

  id = input<string>();

  unitsService = inject(UnitsService);

  unitQuery = injectQuery(() => ({
    queryKey: ['power-production-unit', this.id()],
    queryFn: async () => {
      try {
        return await this.unitsService.getPowerProductionUnit(this.id() ?? '');
      } catch (err: any) {
        throw new Error(err.status === 404 ? ERROR_MESSAGES.unitNotFound + this.id() : ERROR_MESSAGES.unknownError);
      }
    },
    enabled: !!this.id(),
  }));

  readonly MeasurementUnit = MeasurementUnit;
}
