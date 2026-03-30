/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { ICONS } from '../../shared/constants/icons';
import { PrettyEnumPipe } from '../../shared/pipes/format-enum.pipe';

@Component({
  selector: 'app-ppa-status-chip',
  imports: [CommonModule, PrettyEnumPipe],
  template: ` <div
    class="flex w-fit flex-row items-center gap-2 rounded-lg border bg-white px-2 text-sm"
    [ngClass]="{
      'border-secondary-300 text-secondary-400': status() === PowerAccessApprovalStatus.APPROVED,
      'border-error-red text-error-red': status() === PowerAccessApprovalStatus.REJECTED,
      'border-tertiary-400 text-tertiary-400': status() === PowerAccessApprovalStatus.PENDING,
    }"
  >
    <span
      class="material-symbols-outlined text-lg"
      [ngClass]="{
        'text-secondary-400': status() === PowerAccessApprovalStatus.APPROVED,
        'text-error-red': status() === PowerAccessApprovalStatus.REJECTED,
        'text-tertiary-400': status() === PowerAccessApprovalStatus.PENDING,
      }"
    >
      {{ icon() }}
    </span>
    {{ status() | prettyEnum | titlecase }}
  </div>`,
})
export class PpaStatusChipComponent {
  status = input.required<PowerAccessApprovalStatus>();
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;

  statusIcons = {
    [PowerAccessApprovalStatus.APPROVED]: ICONS.PPA_STATUS.APPROVED,
    [PowerAccessApprovalStatus.REJECTED]: ICONS.PPA_STATUS.REJECTED,
    [PowerAccessApprovalStatus.PENDING]: ICONS.PPA_STATUS.PENDING,
  };
  icon = computed(() => {
    return this.statusIcons[this.status()];
  });
}
