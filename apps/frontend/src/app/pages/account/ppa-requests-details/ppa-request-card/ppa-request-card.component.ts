/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaStatusChipComponent } from 'apps/frontend/src/app/layout/chips/ppa-status-chip.component';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { PpaRequestDto } from '@h2-trust/api';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { RequestConfirmationDialogComponent } from '../ppa-confirmation/request-confirmation-dialog.component';

@Component({
  selector: 'app-ppa-request-card',
  imports: [PpaStatusChipComponent, PrettyEnumPipe, CommonModule, MatDivider, MatButtonModule, MatDialogModule],
  templateUrl: './ppa-request-card.component.html',
})
export class PpaRequestCardComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;
  protected readonly PpaRequestRole = PpaRequestRole;

  request = input.required<PpaRequestDto>();
  role = input.required<PpaRequestRole>();

  readonly dialog = inject(MatDialog);

  openDialog(status: PowerAccessApprovalStatus): void {
    this.dialog.open(RequestConfirmationDialogComponent, {
      data: status,
    });
  }
}
