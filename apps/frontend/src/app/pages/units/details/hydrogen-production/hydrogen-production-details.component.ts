/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FormattedUnits } from 'apps/frontend/src/app/shared/constants/formatted-units';
import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HydrogenProductionUnitDto } from '@h2-trust/api';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-hydrogen-production-details',
  imports: [CommonModule, RouterModule, UnitPipe],
  templateUrl: './hydrogen-production-details.component.html',
})
export class HydrogenProductionDetailsComponent {
  unit = input.required<HydrogenProductionUnitDto>();

  readonly FormattedUnits = FormattedUnits;
}
