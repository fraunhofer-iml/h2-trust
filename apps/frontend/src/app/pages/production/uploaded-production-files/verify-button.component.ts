import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ProcessedCsvDto } from '@h2-trust/api';
import { BaseSheetComponent } from '../../../layout/sheet/sheet.component';
import { ProductionService } from '../../../shared/services/production/production.service';
import { ValidationResult } from './validated-file';
import { VerificationDetailsComponent } from './verification-details/verification-details.component';

@Component({
  selector: 'app-verify-button',
  imports: [MatButtonModule, BaseSheetComponent, VerificationDetailsComponent],
  templateUrl: './verify-button.component.html',
})
export class VerifyButtonComponent {
  fileService = inject(ProductionService);

  file = input.required<ProcessedCsvDto>();

  verifying = false;

  verificationQuery = injectQuery(() => ({
    queryKey: ['verify', this.file().id],
    queryFn: async () => await this.fileService.validateFile(),
    enabled: false,
  }));

  verificationEMitter = output<ValidationResult | undefined>();

  async verify() {
    const res = await this.verificationQuery.refetch();
    this.verificationEMitter.emit(res.data);
  }
}
