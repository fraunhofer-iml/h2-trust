/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { PpaRequestDto } from '@h2-trust/contracts';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { ppaRequestsQueryOptions } from '../../../shared/queries/ppa-requests.query';
import { PowerAccessApprovalService } from '../../../shared/services/power-access-approvals/power-access-approvals.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UserRolesStore } from '../../../shared/store/user-role.store';
import { CreatePpaRequestComponent } from '../create-ppa-request/create-ppa-request.component';
import { PpaRequestsListComponent } from './ppa-requests-list/ppa-requests-list.component';

@Component({
  selector: 'app-ppa-requests',
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
    MatTabsModule,
    PpaRequestsListComponent,
  ],
  templateUrl: './ppa-requests.component.html',
})
export class PpaRequestsComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;
  protected readonly PpaRequestRole = PpaRequestRole;

  protected readonly unitsService = inject(UnitsService);
  protected readonly ppaService = inject(PowerAccessApprovalService);
  protected roles = inject(UserRolesStore);
  dialog = inject(MatDialog);

  ppaRequestsSentQuery = injectQuery(() => ppaRequestsQueryOptions(this.ppaService, PpaRequestRole.SENDER));

  ppaRequestsSent = computed(() => {
    const requests = this.ppaRequestsSentQuery.data();
    return this.mapByStatus(requests ?? []);
  });

  ppaRequestsReceivedQuery = injectQuery(() => ppaRequestsQueryOptions(this.ppaService, PpaRequestRole.RECEIVER));

  ppaRequestsReceived = computed(() => {
    const requests = this.ppaRequestsReceivedQuery.data();
    return this.mapByStatus(requests ?? []);
  });

  mapByStatus(requests: PpaRequestDto[]): { pending: PpaRequestDto[]; closed: PpaRequestDto[] } {
    const result: { pending: PpaRequestDto[]; closed: PpaRequestDto[] } = { pending: [], closed: [] };
    requests.map((val) =>
      val.status === PowerAccessApprovalStatus.PENDING ? result.pending.push(val) : result.closed.push(val),
    );
    return result;
  }

  openDialog() {
    this.dialog.open(CreatePpaRequestComponent);
  }
}
