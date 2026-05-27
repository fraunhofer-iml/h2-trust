/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-ppa-status-chip',
  imports: [StatusChipComponent, EnumPipe],
  template: `<app-status-chip
    [icon]="icon()"
    [label]="status() | enum: 'ppaStatus'"
    [chipClass]="chipClass()"
    [iconClass]="iconClass()"
  />`,
})
export class PpaStatusChipComponent {
  status = input.required<PowerPurchaseAgreementStatus>();

  private readonly styleByStatus = {
    [PowerPurchaseAgreementStatus.APPROVED]: {
      chipClass: 'border-secondary-100 bg-secondary-100/60 text-secondary-700',
      iconClass: 'text-secondary-700',
    },
    [PowerPurchaseAgreementStatus.REJECTED]: {
      chipClass: 'border-red-600 bg-red-100 text-red-700',
      iconClass: 'text-red-700',
    },
    [PowerPurchaseAgreementStatus.PENDING]: {
      chipClass: 'border-tertiary-100 text-tertiary-700 bg-tertiary-100/60',
      iconClass: 'text-tertiary-700',
    },
  };

  private readonly statusIcons = {
    [PowerPurchaseAgreementStatus.APPROVED]: ICONS.PPA_STATUS.APPROVED,
    [PowerPurchaseAgreementStatus.REJECTED]: ICONS.PPA_STATUS.REJECTED,
    [PowerPurchaseAgreementStatus.PENDING]: ICONS.PPA_STATUS.PENDING,
  };

  icon = computed(() => {
    return this.statusIcons[this.status()];
  });

  chipClass = computed(() => {
    return this.styleByStatus[this.status()].chipClass;
  });

  iconClass = computed(() => {
    return this.styleByStatus[this.status()].iconClass;
  });
}
