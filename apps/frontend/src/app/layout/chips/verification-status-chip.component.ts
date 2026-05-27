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

  private readonly statusIcons = {
    [CsvDocumentIntegrityStatus.MISMATCH]: 'cancel',
    [CsvDocumentIntegrityStatus.FAILED]: 'warning',
    [CsvDocumentIntegrityStatus.VERIFIED]: 'check_circle',
  };

  private readonly styleByStatus = {
    [CsvDocumentIntegrityStatus.MISMATCH]: {
      chipClass: 'border-red-600 bg-red-100 text-red-700',
      iconClass: 'text-red-700',
    },
    [CsvDocumentIntegrityStatus.FAILED]: {
      chipClass: 'border-yellow-600 bg-yellow-100 text-yellow-700',
      iconClass: 'text-yellow-700',
    },
    [CsvDocumentIntegrityStatus.VERIFIED]: {
      chipClass: 'border-secondary-100 bg-secondary-100/60 text-secondary-700',
      iconClass: 'text-secondary-700',
    },
  };

  icon = computed(() => {
    if (!this.verifiable()) {
      return 'block';
    }

    return this.statusIcons[this.status() ?? CsvDocumentIntegrityStatus.VERIFIED] ?? 'circle';
  });

  chipClass = computed(() => {
    if (!this.verifiable()) {
      return this.defaultChipClass;
    }

    return this.styleByStatus[this.status() ?? CsvDocumentIntegrityStatus.VERIFIED]?.chipClass ?? this.defaultChipClass;
  });

  iconClass = computed(() => {
    if (!this.verifiable()) {
      return this.defaultIconClass;
    }

    return this.styleByStatus[this.status() ?? CsvDocumentIntegrityStatus.VERIFIED]?.iconClass ?? this.defaultIconClass;
  });
}
