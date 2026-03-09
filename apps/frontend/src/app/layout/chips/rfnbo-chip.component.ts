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
import { ICONS } from '../../shared/constants/icons';
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-rfnbo-chip',
  imports: [CommonModule, PrettyEnumPipe],
  template: `<div class="flex w-fit min-w-40 flex-row items-center gap-2 rounded-lg border px-2" [ngClass]="chipColor">
    <span class="material-symbols-outlined text-lg"> {{ icon() }} </span>
    {{ this.normalizedStatus() | prettyEnum | titlecase }}
  </div>`,
})
export class RfnboChipComponent {
  protected readonly defaultChipColor = 'text-neutral-600 bg-neutral-600/20 border-neutral-600/10 rounded-md';
  protected readonly defaultIconColor = 'bg-neutral-600';

  rfnboType = input.required<string | boolean>();

  normalizedStatus = computed((): string => {
    const status = this.rfnboType();

    if (typeof status === 'boolean') {
      return status ? RfnboType.RFNBO_READY : RfnboType.NON_CERTIFIABLE;
    }

    return status;
  });

  icon = computed(() => {
    return this.normalizedStatus() === RfnboType.NON_CERTIFIABLE
      ? ICONS.HYDROGEN.NON_CERTIFIABLE
      : ICONS.HYDROGEN.RFNBO_READY;
  });

  private readonly chipColorByRFNBO = new Map([
    ['RFNBO_READY', 'bg-secondary-100 text-secondary-600 border-secondary-200'],
    ['NON_CERTIFIABLE', 'text-neutral-600 bg-neutral-100 border-neutral-200'],
  ]);

  get chipColor(): string | undefined {
    return this.chipColorByRFNBO.get(this.normalizedStatus());
  }
}
