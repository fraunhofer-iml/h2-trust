import { Observable, of } from 'rxjs';
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
import { CompanyDto, FGFile, HydrogenStorageOverviewDto, UserDetailsDto, UserDto } from '@h2-trust/api';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { CompaniesService } from '../../../shared/services/companies/companies.service';
import { UnitsService } from '../../../shared/services/units/units.service';
import { UsersService } from '../../../shared/services/users/users.service';
import { UploadFormComponent } from '../upload-form/upload-form.component';

@Component({
  selector: 'app-add-bottle',
  providers: [provideNativeDateAdapter(), CompaniesService],
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
  ],
  templateUrl: './add-bottle.component.html',
  styleUrl: './add-bottle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBottleComponent implements OnInit {
  userId: string = '';
  selectedValue: string = '';
  selectedCar: string = '';
  uploadedFiles: FGFile[] = [];
  storageUnits: Observable<HydrogenStorageOverviewDto[]> = of([]);
  recipients: Observable<CompanyDto[]> = of([]);

  bottleFormGroup: FormGroup = new FormGroup({
    date: new FormControl<Date | undefined>(undefined, Validators.required),
    time: new FormControl<string | undefined>(undefined, Validators.required),
    amount: new FormControl<number | undefined>(undefined, Validators.required),
    recipient: new FormControl<UserDto | undefined>(undefined, Validators.required),
    storageUnit: new FormControl<HydrogenStorageOverviewDto | undefined>(undefined, Validators.required),
  });

  constructor(
    public dialogRef: MatDialogRef<AddBottleComponent>,
    private readonly unitsService: UnitsService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) {}

  async ngOnInit() {
    await this.authService.getUserId().then((userId) => {
      this.userId = userId;
      if (userId) {
        this.usersService.getUserAccountInformation(userId).subscribe((userDetails: UserDetailsDto) => {
          this.storageUnits = this.unitsService.getHydrogenStorageUnitsOfCompany(userDetails.company.id);
          this.recipients = this.companiesService.getRecipients();
        });
      } else {
        throw new Error('No userId');
      }
    });
  }

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

    data.append('amount', this.bottleFormGroup.controls['amount'].value);
    data.append('recipient', this.bottleFormGroup.controls['recipient'].value.id);
    data.append('filledAt', this.createTimestamp().toISOString());
    data.append('recordedBy', this.userId);
    data.append('hydrogenStorageUnit', this.bottleFormGroup.controls['storageUnit'].value.id);

    this.dialogRef.close(data);
  }

  createTimestamp() {
    let pickedDate = new Date();
    let pickedTimeAsDate = new Date();

    if (this.bottleFormGroup.controls['date'].value && this.bottleFormGroup.controls['time'].value) {
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
