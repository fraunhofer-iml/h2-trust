/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeasurementUnit } from '@h2-trust/domain';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { UnitDetailsComponent } from '../unit-details.component';

@Component({
  selector: 'app-hydrogen-production-details',
  imports: [CommonModule, RouterModule, UnitPipe, UnitDetailsComponent],
  templateUrl: './hydrogen-production-details.component.html',
})
export class HydrogenProductionDetailsComponent {
  readonly MeasurementUnit = MeasurementUnit;

  id = input<string>();

  unitsService = inject(UnitsService);

  unitQuery = injectQuery(() => ({
    queryKey: ['hydrogen-production-unit', this.id()],
    queryFn: () => this.unitsService.getHydrogenProductionUnit(this.id() ?? ''),
    enabled: !!this.id(),
  }));
}
