/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { PpaRequestDto } from '@h2-trust/api';
import { PpaRequestRole } from '@h2-trust/domain';
import { EmptyStateComponent } from '../../../../layout/empty-state/empty-state.component';
import { PpaRequestCardComponent } from '../ppa-request-card/ppa-request-card.component';

interface PpaRequestsData {
  pending: PpaRequestDto[];
  closed: PpaRequestDto[];
}

@Component({
  selector: 'app-ppa-requests-list',
  standalone: true,
  imports: [MatDividerModule, PpaRequestCardComponent, EmptyStateComponent],
  templateUrl: './ppa-requests-list.component.html',
})
export class PpaRequestsListComponent {
  role = input.required<PpaRequestRole>();
  data = input.required<PpaRequestsData | undefined>();

  pendingEmptyState = computed(() => {
    if (this.role() === PpaRequestRole.RECEIVER) {
      return {
        icon: 'task_alt',
        title: 'No pending requests',
        description: 'There are no requests that require an action from you.',
      };
    }

    return {
      icon: 'task_alt',
      title: 'No pending requests',
      description: 'All your requests have been answered.',
    };
  });

  closedEmptyState = computed(() => {
    if (this.role() === PpaRequestRole.RECEIVER) {
      return {
        icon: 'data_object',
        title: 'No closed requests',
        description: 'You have not approved or declined any requests yet.',
      };
    }

    return {
      icon: 'data_object',
      title: 'No closed requests',
      description: 'None of your requests have been answered yet.',
    };
  });

  protected readonly PpaRequestRole = PpaRequestRole;
}
