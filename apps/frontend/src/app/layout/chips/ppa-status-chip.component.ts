/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { PowerPurchaseAgreementStatus } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';

@Component({
  selector: 'app-ppa-status-chip',
  imports: [CommonModule, EnumPipe],
  template: ` <div
    class="flex w-fit flex-row items-center gap-2 rounded-lg border px-2 text-sm"
    [ngClass]="{
      'border-secondary-100 text-secondary-700 bg-secondary-100/60': status() === PowerPurchaseAgreementStatus.APPROVED,
      'border-error-red/20 text-error-red bg-error-red/20': status() === PowerPurchaseAgreementStatus.REJECTED,
      'border-tertiary-100 text-tertiary-700 bg-tertiary-100/60': status() === PowerPurchaseAgreementStatus.PENDING,
    }"
  >
    <span
      class="material-symbols-outlined text-base!"
      [ngClass]="{
        'text-secondary-700': status() === PowerPurchaseAgreementStatus.APPROVED,
        'text-error-red': status() === PowerPurchaseAgreementStatus.REJECTED,
        'text-tertiary-700': status() === PowerPurchaseAgreementStatus.PENDING,
      }"
    >
      {{ icon() }}
    </span>
    {{ status() | enum: 'ppaStatus' }}
  </div>`,
})
export class PpaStatusChipComponent {
  status = input.required<PowerPurchaseAgreementStatus>();
  protected readonly PowerPurchaseAgreementStatus = PowerPurchaseAgreementStatus;

  statusIcons = {
    [PowerPurchaseAgreementStatus.APPROVED]: ICONS.PPA_STATUS.APPROVED,
    [PowerPurchaseAgreementStatus.REJECTED]: ICONS.PPA_STATUS.REJECTED,
    [PowerPurchaseAgreementStatus.PENDING]: ICONS.PPA_STATUS.PENDING,
  };
  icon = computed(() => {
    return this.statusIcons[this.status()];
  });
}
