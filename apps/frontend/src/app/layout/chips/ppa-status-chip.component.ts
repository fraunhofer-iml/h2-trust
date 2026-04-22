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
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-ppa-status-chip',
  imports: [CommonModule, PrettyEnumPipe],
  template: ` <div
    class="flex w-fit flex-row items-center gap-2 rounded-lg border bg-white px-2 text-sm"
    [ngClass]="{
      'border-secondary-300 text-secondary-400': status() === PowerPurchaseAgreementStatus.APPROVED,
      'border-error-red text-error-red': status() === PowerPurchaseAgreementStatus.REJECTED,
      'border-tertiary-400 text-tertiary-400': status() === PowerPurchaseAgreementStatus.PENDING,
    }"
  >
    <span
      class="material-symbols-outlined text-base!"
      [ngClass]="{
        'text-secondary-400': status() === PowerPurchaseAgreementStatus.APPROVED,
        'text-error-red': status() === PowerPurchaseAgreementStatus.REJECTED,
        'text-tertiary-400': status() === PowerPurchaseAgreementStatus.PENDING,
      }"
    >
      {{ icon() }}
    </span>
    {{ status() | prettyEnum | titlecase }}
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
