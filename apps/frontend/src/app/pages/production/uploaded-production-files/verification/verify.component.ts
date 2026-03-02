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
  resultStore = inject(VerificationResultStore);

  verifying = false;

  async verify() {
    this.verifying = true;
    const res = await this.fileService.validateFile(this.file().id);
    this.resultStore.setItem(this.file().id, res);
    this.verifying = false;
  }

  onCopied(success: boolean) {
    if (success) {
      toast.success('Transaction hash copied to clipboard!');
    }
  }

  openExplorer(url: string | null) {
    if (!url) {
      toast.error('Missing explorer url!');
      return;
    }

    window.open(url, '_blank');
  }

  get result() {
    return this.resultStore.getItem(this.file().id);
  }
}
