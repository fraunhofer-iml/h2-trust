/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { CsvDocumentIntegrityResultDto } from '@h2-trust/contracts/dtos';

@Injectable()
export class VerificationResultStore {
  private readonly storagePrefix = 'verify_';
  private verificationResults = new Map<string, CsvDocumentIntegrityResultDto>();

  setVerificationResult(key: string, value: CsvDocumentIntegrityResultDto): void {
    this.verificationResults.set(key, value);
    localStorage.setItem(`${this.storagePrefix}${key}`, JSON.stringify(value));
  }

  getVerificationResult(key: string): CsvDocumentIntegrityResultDto | undefined {
    let result = this.verificationResults.get(key);

    if (!result) {
      const stored = localStorage.getItem(`${this.storagePrefix}${key}`);

      if (stored) {
        result = JSON.parse(stored) as CsvDocumentIntegrityResultDto;
        this.verificationResults.set(key, result);
      }
    }

    return result;
  }

  clear(): void {
    this.verificationResults.clear();

    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storagePrefix))
      .forEach((key) => localStorage.removeItem(key));
  }
}
