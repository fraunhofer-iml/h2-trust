/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { RfnboType } from '@h2-trust/domain';
import { getRfnboIcon } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-rfnbo-chip',
  imports: [StatusChipComponent, EnumPipe],
  template: `<app-status-chip
    [icon]="icon()"
    [label]="normalizedStatus() | enum: 'rfnboType'"
    [chipClass]="chipClass()"
  />`,
})
export class RfnboChipComponent {
  rfnboType = input.required<RfnboType | boolean>();

  private readonly chipClassByType = {
    [RfnboType.NOT_SPECIFIED]: 'border-neutral-300 bg-neutral-100 text-neutral-600',
    [RfnboType.RFNBO_READY]: 'border-secondary-200 bg-secondary-100/60 text-secondary-700',
    [RfnboType.NON_CERTIFIABLE]: 'border-neutral-200 bg-neutral-100 text-neutral-600',
  };

  normalizedStatus = computed((): RfnboType => {
    const status = this.rfnboType();

    if (typeof status === 'boolean') {
      return status ? RfnboType.RFNBO_READY : RfnboType.NON_CERTIFIABLE;
    }

    return status;
  });

  icon = computed(() => {
    return getRfnboIcon(this.normalizedStatus());
  });

  chipClass = computed(() => {
    return this.chipClassByType[this.normalizedStatus()];
  });
}
