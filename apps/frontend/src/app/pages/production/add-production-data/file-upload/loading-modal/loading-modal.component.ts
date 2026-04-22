import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { ModalData } from '../modal-data.model';
import { UploadFlowAction } from '../upload-flow-action.enum';

@Component({
  selector: 'app-loading-modal',
  imports: [MatProgressBarModule, MatDialogModule, MatButtonModule],
  templateUrl: './loading-modal.component.html',
})
export class LoadingModalComponent {
  protected readonly UploadFlowAction = UploadFlowAction;

  protected readonly data: ModalData = inject(MAT_DIALOG_DATA);
  protected readonly dialogRef = inject(MatDialogRef<LoadingModalComponent>);
  protected readonly router = inject(Router);

  close(action: UploadFlowAction) {
    this.dialogRef.close(action);
  }
}
