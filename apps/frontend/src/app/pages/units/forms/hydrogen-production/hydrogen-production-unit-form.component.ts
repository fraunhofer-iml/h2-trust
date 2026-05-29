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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  BiddingZone,
  GridLevel,
  HydrogenProductionTechnology,
  HydrogenProductionType,
  PowerProductionType,
} from '@h2-trust/domain';
import { EnumPipe } from '../../../../shared/pipes/enum.pipe';
import { HydrogenProductionFormGroup } from '../forms';

@Component({
  selector: 'app-hydrogen-production-unit-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    EnumPipe,
  ],
  templateUrl: './hydrogen-production-unit-form.component.html',
})
export class HydrogenProductionUnitFormComponent {
  protected readonly HydrogenProductionMethod = HydrogenProductionType;

  availableBiddingZones = Object.values(BiddingZone);
  availableGridLevels = Object.entries(GridLevel);
  availablePowerProductionType = Object.entries(PowerProductionType);

  hydrogenProductionForm = input.required<FormGroup<HydrogenProductionFormGroup>>();

  private readonly H2_PRODUCTION_TYPES: Map<HydrogenProductionType, typeof HydrogenProductionTechnology> = new Map([
    [HydrogenProductionType.ELECTROLYSIS, HydrogenProductionTechnology],
  ]);

  get availableTechnologies() {
    const selectedMethod = this.hydrogenProductionForm().value.method;
    if (!selectedMethod) return [];

    const technologiesForMethod = this.H2_PRODUCTION_TYPES.get(selectedMethod);
    if (!technologiesForMethod) return [];

    return Object.entries(technologiesForMethod) ?? [];
  }
}
