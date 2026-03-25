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
import { HydrogenStorageType } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { HydrogenStorageFormGroup } from '../forms';

@Component({
  selector: 'app-hydrogen-storage-unit-form',
  imports: [
    CommonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    PrettyEnumPipe,
    FormsModule,
    MatInputModule,
  ],
  templateUrl: './hydrogen-storage-unit-form.component.html',
})
export class HydrogenUnitFormComponent {
  protected readonly HydrogenStorageType = HydrogenStorageType;

  hydrogenStorageForm = input.required<FormGroup<HydrogenStorageFormGroup>>();
}
