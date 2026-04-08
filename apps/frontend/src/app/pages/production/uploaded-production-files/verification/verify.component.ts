/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { toast } from 'ngx-sonner';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ProcessedCsvDto } from '@h2-trust/api';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';
import { BaseSheetComponent } from '../../../../layout/sheet/sheet.component';
import { ProductionService } from '../../../../shared/services/production/production.service';
import { VerificationResultStore } from '../../../../shared/store/verification-result.store';

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
  verificationResultStore = inject(VerificationResultStore);

  verifying = false;

  async verify() {
    this.verifying = true;
    const res = await this.fileService.validateFile(this.file().id);
    this.verificationResultStore.setVerificationResult(this.file().id, res);
    this.verifying = false;
  }

  onCopied(success: boolean, label: string) {
    if (success) {
      toast.success(`${label} copied to clipboard.`);
    }
  }

  openUrl(url: string | null) {
    if (!url) {
      toast.error('Link is not available.');
      return;
    }

    window.open(url, '_blank');
  }

  // TODO-MP: use DateTimeUtil instead of this method and handle "Not available" case in template
  formatDateTime(value: string | Date | null) {
    if (!value) {
      return 'Not available';
    }

    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'UTC',
    }).format(new Date(value));
  }

  get result() {
    return this.verificationResultStore.getVerificationResult(this.file().id);
  }
}
