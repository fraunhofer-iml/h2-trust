import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { FGFile, HydrogenStorageOverviewDto, UserDto } from '@h2-trust/api';
import { ErrorCardComponent } from '../../../layout/error-card/error-card.component';
import { ERROR_MESSAGES } from '../../../shared/constants/error.messages';
import { BottlingService } from '../../../shared/services/bottling/bottling.service';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UploadFormComponent } from './upload-form/upload-form.component';

@Component({
  selector: 'app-add-bottle',
  providers: [provideNativeDateAdapter(), CompaniesService, BottlingService],
  imports: [
    MatDialogModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    UploadFormComponent,
    ErrorCardComponent,
  ],
  templateUrl: './add-bottle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBottleComponent implements OnInit {
  ERROR_MESSAGES = ERROR_MESSAGES;

  selectedValue = '';
  dateDelimiter: Date = new Date();
  uploadedFiles: FGFile[] = [];

  bottleFormGroup: FormGroup = new FormGroup({
    date: new FormControl<Date | undefined>(new Date(), Validators.required),
    time: new FormControl<Date | undefined>(new Date(), Validators.required),
    amount: new FormControl<number | undefined>(undefined, Validators.required),
    recipient: new FormControl<UserDto | undefined>(undefined, Validators.required),
    storageUnit: new FormControl<HydrogenStorageOverviewDto | undefined>(undefined, Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<AddBottleComponent>,
    private readonly unitsService: UnitsService,
    private readonly companiesService: CompaniesService,
    private readonly processService: BottlingService,
  ) {}

  ngOnInit() {
    this.bottleFormGroup.controls['amount']?.valueChanges.subscribe((amount) => {
      if (amount > this.bottleFormGroup.controls['storageUnit']?.value.filling)
        this.bottleFormGroup.controls['storageUnit']?.reset();
    });
  }

  hydrogenStorageQuery = injectQuery(() => ({
    queryKey: ['h2-storage'],
    queryFn: () => this.unitsService.getHydrogenStorageUnits(),
  }));

  recipientsQuery = injectQuery(() => ({
    queryKey: ['recipients'],
    queryFn: () => this.companiesService.getRecipients(),
  }));

  submitFile({ file, documentType }: FGFile): void {
    this.uploadedFiles.push({ file, documentType });
  }

  removeFile({ file, documentType }: FGFile): void {
    this.uploadedFiles = this.uploadedFiles.filter(
      (uploadedFile: FGFile) => uploadedFile.file !== file && uploadedFile.documentType !== documentType,
    );
  }

  createBottleData() {
    const data = new FormData();

    if (this.uploadedFiles) {
      for (const file of this.uploadedFiles) {
        data.append('file', file.file);
      }
    }

    data.append('amount', this.bottleFormGroup.controls['amount']?.value ?? '');
    data.append('recipient', this.bottleFormGroup.controls['recipient']?.value?.id ?? '');
    data.append('filledAt', this.createTimestamp().toISOString());
    data.append('recordedBy', '');
    data.append('hydrogenStorageUnit', this.bottleFormGroup.controls['storageUnit']?.value?.id ?? '');
    this.mutation.mutate(data);
  }

  mutation = injectMutation(() => ({
    mutationFn: (dto: FormData) => this.processService.createBottleBatch(dto),
    onSuccess: () => {
      this.dialogRef.close(true);
    },
  }));

  createTimestamp() {
    let pickedDate = new Date();
    let pickedTimeAsDate = new Date();

    if (this.bottleFormGroup.controls['date']?.value && this.bottleFormGroup.controls['time']?.value) {
      pickedDate = new Date(this.bottleFormGroup.controls['date'].value);
      pickedTimeAsDate = new Date(this.bottleFormGroup.controls['time'].value);
      pickedDate.setHours(pickedTimeAsDate.getHours());
      pickedDate.setMinutes(pickedTimeAsDate.getMinutes());
    } else {
      throw new Error('No Date and/or Time Found');
    }

    return pickedDate;
  }
}
