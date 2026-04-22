import { HttpErrorResponse } from '@angular/common/http';
import { Signal } from '@angular/core';
import { AccountingPeriodMatchingResultDto } from '@h2-trust/contracts/dtos';
import { CsvContentType } from '@h2-trust/domain';

export interface ModalData {
  err: Signal<HttpErrorResponse | null>;
  data: Signal<AccountingPeriodMatchingResultDto | undefined>;
  type: CsvContentType;
}
