/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-unit-status',
  imports: [CommonModule],
  template: `
    <div class="flex flex-row items-center gap-2">
      <div
        class="rounded-full"
        [ngClass]="active() ? 'size-1 animate-ping bg-green-700/80' : 'size-2 bg-neutral-400'"
      ></div>
      {{ active() ? 'Active' : 'Inactive' }}
    </div>
  `,
})
export class UnitStatusComponent {
  active = input.required<boolean>();
}
