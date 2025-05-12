import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FileSizePipe } from '../../../shared/pipes/file-size.pipe';
import { UploadFormSelectType } from './types/upload-form-select.type';

@Component({
  selector: 'app-upload-form',
  imports: [
    FileSizePipe,
    CommonModule,
    MatTooltipModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CommonModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatCardModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  templateUrl: './upload-form.component.html',
})
export class UploadFormComponent {
  @Input() title?: string;
  @Input() buttonText = 'Add file';
  @Input() buttonTooltip = 'Add file to upload at save';
  @Input() selectOptions?: UploadFormSelectType[];
  @Input() showUploadedFiles = true;
  @Input() showDescriptionField = false;
  @Input() informationText?: string;
  @Input() uploadedFiles: { file: File; documentType?: string }[] = [];
  @Input() uploadedFilesPosition: 'bottom' | 'right' = 'bottom';

  @Output() uploadDocument = new EventEmitter<{ file: File; documentType?: string }>();
  @Output() removeDocument = new EventEmitter<{ file: File; documentType?: string }>();
  @Output() removeProof = new EventEmitter<UploadFormSelectType>();

  file: File | null = null;

  formGroup: FormGroup = new FormGroup({
    documentType: new FormControl(null),
    file: new FormControl(null, Validators.required),
    description: new FormControl(null),
  });

  lengthOfUploadedFiles(): number {
    return this.selectOptions?.filter((option) => option.file).length ?? this.uploadedFiles.length;
  }

  onDrop(event: DragEvent, documentType: string): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if ((file && documentType) || (file && this.showDescriptionField)) {
      this.formGroup.patchValue({ file });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (!target.files) return;
    const file = target.files[0];

    this.formGroup.patchValue({
      file: file,
    });
  }

  submitDocument(): void {
    if (this.formGroup.valid) {
      this.uploadDocument.emit({
        file: this.formGroup.value.file,
        documentType: this.formGroup.value.documentType ?? this.formGroup.value.description,
      });
      this.formGroup.reset();
    }
  }
}
