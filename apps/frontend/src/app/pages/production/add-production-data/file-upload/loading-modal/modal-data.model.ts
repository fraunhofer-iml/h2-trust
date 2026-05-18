/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Signal } from '@angular/core';
import { AccountingPeriodMatchingResultDto } from '@h2-trust/contracts/dtos';
import { CsvContentType } from '@h2-trust/domain';

export interface ModalData {
  err: Signal<HttpErrorResponse | null>;
  data: Signal<AccountingPeriodMatchingResultDto | undefined>;
  type: CsvContentType;
}
