/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { BaseChipComponent } from './base-chip/base-chip.comopnent';

@Component({
  selector: 'app-h2-color-chip',
  imports: [CommonModule],
  templateUrl: './base-chip/base-chip.comonent.html',
})
export class H2ColorChipComponent extends BaseChipComponent {
  h2Color = input.required<string>();
  private readonly chipColorByRFNBO = new Map([
    ['RFNBO_READY', 'text-h2-green-text bg-h2-green/20 border-h2-green/10'],
    ['NON_CERTIFIABLE', 'text-h2-yellow-text bg-h2-yellow/20 border-h2-yellow/10'],
  ]);

  private readonly dotColorByRFNBO = new Map([
    ['RFNBO_READY', 'bg-h2-green-text'],
    ['NON_CERTIFIABLE', 'bg-h2-yellow-text'],
  ]);

  get chipColor(): string | undefined {
    return this.chipColorByRFNBO.get(this.h2Color());
  }
  get dotColor(): string | undefined {
    return this.dotColorByRFNBO.get(this.h2Color());
  }
  get label(): string {
    return this.h2Color() ?? 'unknown';
  }
}
