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
import { PowerProductionUnitDto } from '@h2-trust/api';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { UnitPipe } from '../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-power-production-details',
  imports: [CommonModule, PrettyEnumPipe, UnitPipe],
  templateUrl: './power-production-details.component.html',
})
export class PowerProductionDetailsComponent {
  unit = input.required<PowerProductionUnitDto>();

  readonly FormattedUnits = FormattedUnits;
}
