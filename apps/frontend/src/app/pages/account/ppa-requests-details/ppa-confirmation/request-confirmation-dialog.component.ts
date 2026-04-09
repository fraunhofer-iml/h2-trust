/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PowerAccessApprovalStatus } from '@h2-trust/domain';
import { ConfirmationResult } from '../../dialog-data';

@Component({
  selector: 'app-request-confirmation-dialog',
  imports: [
    MatDialogModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatInputModule,
    MatDialogTitle,
    MatDialogActions,
  ],
  templateUrl: './request-confirmation-dialog.component.html',
})
export class RequestConfirmationDialogComponent {
  protected readonly PowerAccessApprovalStatus = PowerAccessApprovalStatus;

  readonly dialogRef = inject(MatDialogRef<RequestConfirmationDialogComponent>);
  readonly data = inject<PowerAccessApprovalStatus>(MAT_DIALOG_DATA);

  readonly comment = model<string>();

  close(confirmed: boolean): void {
    const result: ConfirmationResult = { comment: this.comment(), confirmed: confirmed };
    this.dialogRef.close(result);
  }
}
