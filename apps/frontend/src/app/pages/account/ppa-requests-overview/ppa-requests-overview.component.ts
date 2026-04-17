/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, Signal } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PowerPurchaseAgreementStatus, PpaRequestRole } from '@h2-trust/domain';
import { ppaRequestsQueryOptions } from '../../../shared/queries/ppa-requests.query';
import { PowerPurchaseAgreementService } from '../../../shared/services/power-purchase-agreement/power-purchase-agreement.service';
import { UnitsService } from '../../../shared/services/units/units.service';

interface RequestLabels {
  heading: string;
  description: Record<PowerPurchaseAgreementStatus, string>;
}

@Component({
  selector: 'app-ppa-requests-overview',
  imports: [CommonModule, MatDividerModule],
  templateUrl: './ppa-requests-overview.component.html',
})
export class PpaRequestsOverviewComponent {
  role = input.required<PpaRequestRole>();
  protected PowerPurchaseAgreementStatus = PowerPurchaseAgreementStatus;

  protected readonly ppaService = inject(PowerPurchaseAgreementService);
  protected readonly unitsService = inject(UnitsService);

  ppaRequestsQuery = injectQuery(() => ppaRequestsQueryOptions(this.ppaService, this.role()));

  overview = computed(() => {
    const statistics = this.ppaRequestsQuery.data()?.reduce(
      (acc, item) => {
        acc[item.status]++;
        return acc;
      },
      {
        [PowerPurchaseAgreementStatus.APPROVED]: 0,
        [PowerPurchaseAgreementStatus.REJECTED]: 0,
        [PowerPurchaseAgreementStatus.PENDING]: 0,
      },
    );

    return statistics;
  });

  labels: Signal<RequestLabels> = computed(() => {
    const labelsReceiver: RequestLabels = {
      heading: 'RECEIVED',
      description: {
        [PowerPurchaseAgreementStatus.APPROVED]: 'Requests you have approved.',
        [PowerPurchaseAgreementStatus.REJECTED]: 'Requests you have declined.',
        [PowerPurchaseAgreementStatus.PENDING]: 'Requests awaiting your review.',
      },
    };

    const labelsSender: RequestLabels = {
      heading: 'SENT',
      description: {
        [PowerPurchaseAgreementStatus.APPROVED]: 'Requests that have been approved.',
        [PowerPurchaseAgreementStatus.REJECTED]: 'Requests that have been declined.',
        [PowerPurchaseAgreementStatus.PENDING]: 'Requests awaiting response.',
      },
    };

    return this.role() === PpaRequestRole.RECEIVER ? labelsReceiver : labelsSender;
  });
}
