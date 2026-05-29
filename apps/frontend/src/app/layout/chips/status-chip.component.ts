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
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `<div
    class="flex w-fit flex-row items-center gap-2 rounded-lg border px-2 py-0.5 text-sm"
    [ngClass]="chipClass()"
  >
    <span class="material-symbols-outlined text-base!" [ngClass]="iconClass()">{{ icon() }}</span>
    <span>{{ label() }}</span>
  </div>`,
})
export class StatusChipComponent {
  icon = input.required<string>();
  label = input.required<string>();
  chipClass = input.required<string>();
  iconClass = input<string>('');
}
