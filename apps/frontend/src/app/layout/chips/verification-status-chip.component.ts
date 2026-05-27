/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { TitleCasePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { CsvDocumentIntegrityStatus } from '@h2-trust/domain';
import { StatusChipComponent } from './status-chip.component';

@Component({
  selector: 'app-verification-status-chip',
  standalone: true,
  imports: [StatusChipComponent, TitleCasePipe],
  template: `<app-status-chip
    [icon]="icon()"
    [label]="verifiable() ? (status() ?? 'open' | titlecase) : 'Not verifiable'"
    [chipClass]="chipClass()"
    [iconClass]="iconClass()"
  />`,
})
export class VerificationStatusChipComponent {
  status = input<CsvDocumentIntegrityStatus | undefined>(undefined);
  verifiable = input.required<boolean>();

  private readonly defaultChipClass = 'border-neutral-300 bg-neutral-100 text-neutral-600';
  private readonly defaultIconClass = 'text-neutral-600';

  icon = computed(() => {
    if (!this.verifiable()) {
      return 'block';
    }

    switch (this.status()) {
      case CsvDocumentIntegrityStatus.MISMATCH:
        return 'cancel';
      case CsvDocumentIntegrityStatus.FAILED:
        return 'warning';
      case CsvDocumentIntegrityStatus.VERIFIED:
        return 'check_circle';
      default:
        return 'circle';
    }
  });

  chipClass = computed(() => {
    if (!this.verifiable()) {
      return this.defaultChipClass;
    }

    switch (this.status()) {
      case CsvDocumentIntegrityStatus.MISMATCH:
        return 'border-red-600 bg-red-100 text-red-700';
      case CsvDocumentIntegrityStatus.FAILED:
        return 'border-yellow-600 bg-yellow-100 text-yellow-700';
      case CsvDocumentIntegrityStatus.VERIFIED:
        return 'border-secondary-100 bg-secondary-100/60 text-secondary-700';
      default:
        return this.defaultChipClass;
    }
  });

  iconClass = computed(() => {
    if (!this.verifiable()) {
      return this.defaultIconClass;
    }

    switch (this.status()) {
      case CsvDocumentIntegrityStatus.MISMATCH:
        return 'text-red-700';
      case CsvDocumentIntegrityStatus.FAILED:
        return 'text-yellow-700';
      case CsvDocumentIntegrityStatus.VERIFIED:
        return 'text-secondary-700';
      default:
        return this.defaultIconClass;
    }
  });
}
