/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UploadFlowAction } from '../../../../../shared/constants/upload-flow-action.enum';
import { ModalData } from '../../../../../shared/model/modal-data.model';

@Component({
  selector: 'app-loading-modal',
  imports: [MatProgressBarModule, MatDialogModule, MatButtonModule],
  templateUrl: './loading-modal.component.html',
})
export class LoadingModalComponent {
  protected readonly UploadFlowAction = UploadFlowAction;

  protected readonly data: ModalData = inject(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<LoadingModalComponent>);

  close(action: UploadFlowAction) {
    this.dialogRef.close(action);
  }
}
