/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ErrorCardComponent } from '../../../../layout/error-card/error-card.component';
import { ERROR_MESSAGES } from '../../../../shared/constants/error.messages';

@Component({
  selector: 'app-file-sheet',
  imports: [CommonModule, ErrorCardComponent],
  templateUrl: './file-sheet.component.html',
})
export class FileSheetComponent {
  sanitizer = inject(DomSanitizer);

  url = input<string>('');
  ERROR_MESSAGES = ERROR_MESSAGES;

  sanitizedUrl$ = computed(() =>
    this.url() ? this.sanitizer.bypassSecurityTrustResourceUrl(this.url() + '#toolbar=0&view=FitH') : '',
  );
}
