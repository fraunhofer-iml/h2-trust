import { CommonModule } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProcessedCsvDto } from '@h2-trust/api';
import { BaseSheetComponent } from '../../../layout/sheet/sheet.component';
import { ProductionService } from '../../../shared/services/production/production.service';
import { ValidationResult } from './validated-file';
import { VerificationDetailsComponent } from './verification-details/verification-details.component';

@Component({
  selector: 'app-verify-button',
  imports: [MatButtonModule, BaseSheetComponent, VerificationDetailsComponent, CommonModule],
  templateUrl: './verify-button.component.html',
})
export class VerifyButtonComponent {
  fileService = inject(ProductionService);

  file = input.required<ProcessedCsvDto>();

  verifying = false;
  result: ValidationResult | undefined;

  verificationEMitter = output<ValidationResult | undefined>();

  async verify() {
    this.verifying = true;
    const res = await this.fileService.validateFile(this.file().id);
    console.log(res);
    this.result = { ...res, id: this.file().name };
    this.verificationEMitter.emit({ ...this.result, id: this.file().id });
    this.verifying = false;
  }
}
