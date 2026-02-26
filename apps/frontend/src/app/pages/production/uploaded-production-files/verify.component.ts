import { toast } from 'ngx-sonner';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProcessedCsvDto } from '@h2-trust/api';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';
import { BaseSheetComponent } from '../../../layout/sheet/sheet.component';
import { ProductionService } from '../../../shared/services/production/production.service';
import { VerificationStateService } from '../../../shared/services/verification-state/verification-state.service';

@Component({
  selector: 'app-verify',
  imports: [MatButtonModule, BaseSheetComponent, ClipboardModule, CommonModule],
  templateUrl: './verify.component.html',
})
export class VerifyComponent {
  protected readonly CsvDocumentIntegrityStatus = CsvDocumentIntegrityStatus;
  disabled = input.required<boolean>();
  file = input.required<ProcessedCsvDto>();

  fileService = inject(ProductionService);
  stateService = inject(VerificationStateService);

  verifying = false;

  async verify() {
    this.verifying = true;
    const res = await this.fileService.validateFile(this.file().id);
    this.stateService.setItem(this.file().id, res);
    this.verifying = false;
  }

  onCopied(success: boolean) {
    if (success) {
      toast.success('Transaction hash copied to clipboard!');
    }
  }

  openArbiscan(url: string | null) {
    if (!url) {
      toast.error('Missing explorer url!');
      return;
    }

    window.open(url, '_blank');
  }

  get result() {
    return this.stateService.getItem(this.file().id);
  }
}
