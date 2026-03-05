/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RfnboType } from '@h2-trust/domain';
import { BaseChipComponent } from './base-chip/base-chip.comopnent';

@Component({
  selector: 'app-h2-color-chip',
  imports: [CommonModule],
  templateUrl: './base-chip/base-chip.comonent.html',
})
export class H2ColorChipComponent extends BaseChipComponent {
  rfnboType = input.required<string | boolean>();

  private normalizedStatus = computed((): string => {
    const status = this.rfnboType();

    if (typeof status === 'boolean') {
      return status ? RfnboType.RFNBO_READY : RfnboType.NON_CERTIFIABLE;
    }

    return status;
  });

  override icon = computed(() => {
    return this.normalizedStatus() === RfnboType.NON_CERTIFIABLE ? 'release_alert' : 'editor_choice';
  });

  private readonly chipColorByRFNBO = new Map([
    ['RFNBO_READY', 'bg-secondary-100 text-secondary-600 '],
    ['NON_CERTIFIABLE', 'text-neutral-600 bg-neutral-200 '],
  ]);

  private readonly iconColorByRFNBO = new Map([
    ['RFNBO_READY', 'text-secondary-600'],
    ['NON_CERTIFIABLE', 'text-neutral-600'],
  ]);

  get chipColor(): string | undefined {
    return this.chipColorByRFNBO.get(this.normalizedStatus());
  }
  get dotColor(): string | undefined {
    return this.iconColorByRFNBO.get(this.normalizedStatus());
  }
  get label(): string {
    return this.normalizedStatus() ?? 'unknown';
  }
}
