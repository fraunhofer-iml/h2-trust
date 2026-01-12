/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BaseUnitDto } from '@h2-trust/api';
import { UnitTypeChipComponent } from '../../../layout/unit-type-chip/unit-type-chip.component';

@Component({
  selector: 'app-unit-details',
  imports: [CommonModule, RouterModule, UnitTypeChipComponent],
  templateUrl: './unit-details.component.html',
})
export class UnitDetailsComponent {
  unit = input.required<BaseUnitDto>();
}
