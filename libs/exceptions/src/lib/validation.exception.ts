/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export class ValidationException extends AppException {
  constructor(
    message: string,
    public readonly validationErrors?: string[],
    cause?: unknown,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, cause);
  }
}
