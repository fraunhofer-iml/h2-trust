/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, input } from '@angular/core';
import { EmissionDto } from '@h2-trust/api';
import { MeasurementUnit } from '@h2-trust/domain';
import { UnitPipe } from '../../../../../../shared/pipes/unit.pipe';

@Component({
  selector: 'app-batch-emissions',
  imports: [UnitPipe],
  templateUrl: './batch-emissions.component.html',
})
export class BatchEmissionsComponent {
  emissions = input.required<EmissionDto>();
  protected readonly MeasurementUnit = MeasurementUnit;

  get inputs(): string[] {
    return (this.emissions()?.basisOfCalculation ?? []).filter((input) => input.includes(':'));
  }

  get formulas(): string[] {
    return (this.emissions()?.basisOfCalculation ?? []).filter((formula) => formula.includes('='));
  }
}
