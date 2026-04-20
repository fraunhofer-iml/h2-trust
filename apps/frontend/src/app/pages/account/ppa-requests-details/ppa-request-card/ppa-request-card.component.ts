/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PpaStatusChipComponent } from 'apps/frontend/src/app/layout/chips/ppa-status-chip.component';
import { BaseSheetComponent } from 'apps/frontend/src/app/layout/sheet/sheet.component';
import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { PpaRequestDto } from '@h2-trust/contracts';
import { PowerAccessApprovalStatus, PpaRequestRole } from '@h2-trust/domain';
import { PrettyEnumPipe } from '../../../../shared/pipes/format-enum.pipe';
import { ConfirmationResult } from '../../dialog-data';
import { RequestConfirmationDialogComponent } from '../ppa-confirmation/request-confirmation-dialog.component';

@Component({
  selector: 'app-ppa-request-card',
  imports: [
    PpaStatusChipComponent,
    PrettyEnumPipe,
    CommonModule,
    MatDivider,
    MatButtonModule,
    MatDialogModule,
    A11yModule,
    BaseSheetComponent,
  ],
  templateUrl: './ppa-request-card.component.html',
})
export class PpaRequestCardComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;
  protected readonly PpaRequestRole = PpaRequestRole;

  request = input.required<PpaRequestDto>();
  role = input.required<PpaRequestRole>();

  readonly dialog = inject(MatDialog);

  openDialog(status: PowerAccessApprovalStatus.APPROVED | PowerAccessApprovalStatus.REJECTED): void {
    const dialogRef = this.dialog.open(RequestConfirmationDialogComponent, {
      data: { status, request: this.request() },
    });

    dialogRef.afterClosed().subscribe((result: ConfirmationResult) => {
      console.log(result);
    });
  }

  get dateLable() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let prefix: string;
    let targetDate: Date;

    if (this.request().status === PowerAccessApprovalStatus.PENDING) {
      prefix = 'Created ';
      targetDate = new Date(this.request().createdAt);
    } else {
      const decidedAt = this.request().decidedAt;
      if (!decidedAt) return;

      prefix = 'Decided ';
      targetDate = new Date(decidedAt);
    }

    const target = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return prefix + 'today';
    if (diffDays === 1) return prefix + 'yesterday';
    if (diffDays === 2) return prefix + 'two days ago';

    return prefix + `on ${targetDate.toLocaleDateString('en-GB', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }
}
