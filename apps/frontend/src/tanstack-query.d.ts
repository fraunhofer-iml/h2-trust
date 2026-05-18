/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetail } from '../../shared/model/problem-detail.model';

type ProblemHttpErrorResponse = HttpErrorResponse & {
  error: ProblemDetail | unknown;
};

declare module '@tanstack/query-core' {
  interface Register {
    defaultError: ProblemHttpErrorResponse;
  }
}
