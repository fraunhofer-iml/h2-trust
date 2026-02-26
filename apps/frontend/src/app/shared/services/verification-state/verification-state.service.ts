import { Injectable } from '@angular/core';
import { CsvDocumentIntegrityResultDto } from '@h2-trust/api';

@Injectable({
  providedIn: 'root',
})
export class VerificationStateService {
  private verificationState: Map<string, CsvDocumentIntegrityResultDto> = new Map();

  setItem(key: string, value: CsvDocumentIntegrityResultDto) {
    this.verificationState.set(key, value);
  }

  getItem(key: string): CsvDocumentIntegrityResultDto | undefined {
    return this.verificationState.get(key);
  }
}
