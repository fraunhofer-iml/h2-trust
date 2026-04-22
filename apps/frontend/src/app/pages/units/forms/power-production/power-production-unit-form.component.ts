/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BiddingZone, GridLevel, PowerProductionType } from '@h2-trust/domain';
import { InfoTooltipComponent } from '../../../../layout/info-tooltip/info-tooltip.component';
import { RFNBO_CRITERIA } from '../../../../shared/constants/rfnbo-criteria';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { PowerProductionFormGroup } from '../forms';

@Component({
  selector: 'app-power-production-unit-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    PrettyEnumPipe,
    InfoTooltipComponent,
    MatDatepickerModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
  ],
  providers: [provideNativeDateAdapter()],

  templateUrl: './power-production-unit-form.component.html',
})
export class PowerProductionUnitFormComponent {
  protected readonly RED_III_CRITERIA = RFNBO_CRITERIA;

  powerProductionForm = input.required<FormGroup<PowerProductionFormGroup>>();

  availableBiddingZones = Object.values(BiddingZone);
  availableGridLevels = Object.entries(GridLevel);
  availablePowerProductionType = Object.entries(PowerProductionType);
}
