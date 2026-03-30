/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, computed, input } from '@angular/core';
import { PpaRequestRole } from '@h2-trust/domain';

interface RequestConfig {
  icon: string;
  label: string;
  description: string;
}

@Component({
  selector: 'app-empty-requests',
  imports: [],
  templateUrl: './empty-requests.component.html',
})
export class EmptyRequestsComponent {
  role = input.required<PpaRequestRole>();
  pending = input.required<boolean>();

  config = computed<RequestConfig>(() => {
    switch (this.role()) {
      case PpaRequestRole.RECEIVER:
        return this.pending()
          ? {
              icon: 'task_alt',
              label: 'No pending requests',
              description: 'There are no requests that require an action from you.',
            }
          : {
              icon: 'data_object',
              label: 'No closed requests',
              description: 'You have not approved or declined any requests yet.',
            };

      case PpaRequestRole.SENDER:
        return this.pending()
          ? {
              icon: 'task_alt',
              label: 'No pending requests',
              description: 'All your requests have been answered.',
            }
          : {
              icon: 'data_object',
              label: 'No closed requests',
              description: 'None of your requests have been answered yet.',
            };
    }
  });
}
