/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { CsvDocumentIntegrityResultDto } from '@h2-trust/api';

@Injectable({
  providedIn: 'root',
})
export class VerificationResultStore {
  private verificationState: Map<string, CsvDocumentIntegrityResultDto> = new Map();

  setItem(key: string, value: CsvDocumentIntegrityResultDto) {
    this.verificationState.set(key, value);
  }

  getItem(key: string): CsvDocumentIntegrityResultDto | undefined {
    return this.verificationState.get(key);
  }
}
