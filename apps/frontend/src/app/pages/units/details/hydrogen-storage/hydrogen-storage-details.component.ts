/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormattedUnits } from 'apps/frontend/src/app/shared/constants/formatted-units';
import { UnitsService } from 'apps/frontend/src/app/shared/services/units/units.service';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';
import { UnitDetailsComponent } from '../unit-details.component';

@Component({
  selector: 'app-hydrogen-storage-details',
  imports: [CommonModule, UnitPipe, UnitDetailsComponent, RouterModule],
  templateUrl: './hydrogen-storage-details.component.html',
})
export class HydrogenStorageDetailsComponent {
  readonly FormattedUnits = FormattedUnits;

  id = input<string>();

  unitsService = inject(UnitsService);

  unitQuery = injectQuery(() => ({
    queryKey: ['hydrogen-storage-unit', this.id()],
    queryFn: () => this.unitsService.getHydrogenStorageUnit(this.id() ?? ''),
    enabled: !!this.id(),
  }));
}
