/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, input } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { PpaRequestDto } from '@h2-trust/contracts/dtos';
import { PpaRequestRole } from '@h2-trust/domain';
import { EmptyRequestsComponent } from '../empty-requests-list/empty-requests.component';
import { PpaRequestCardComponent } from '../ppa-request-card/ppa-request-card.component';

interface PpaRequestsData {
  pending: PpaRequestDto[];
  closed: PpaRequestDto[];
}

@Component({
  selector: 'app-ppa-requests-list',
  standalone: true,
  imports: [MatDividerModule, PpaRequestCardComponent, EmptyRequestsComponent],
  templateUrl: './ppa-requests-list.component.html',
})
export class PpaRequestsListComponent {
  role = input.required<PpaRequestRole>();
  data = input.required<PpaRequestsData | undefined>();

  protected readonly PpaRequestRole = PpaRequestRole;
}
