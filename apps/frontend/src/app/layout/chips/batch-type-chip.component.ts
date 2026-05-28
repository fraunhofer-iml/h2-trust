/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { ProcessType } from '@h2-trust/domain';
import { getProcessTypeIcon } from '../../shared/constants/icons';
import { EnumPipe } from '../../shared/pipes/enum.pipe';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-batch-type-chip',
  imports: [StatusChipComponent, EnumPipe],
  template: `<app-status-chip
    [icon]="icon()"
    [label]="type() | enum: 'processType'"
    chipClass="border-primary-200 bg-primary-100/60 text-primary-700"
    iconClass="text-primary-700"
  />`,
})
export class BatchTypeChipComponent {
  type = input.required<ProcessType>();

  icon = computed(() => {
    return getProcessTypeIcon(this.type());
  });
}
