/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export type DomainErrorCode =
  | ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION
  | ErrorCode.DOMAIN_INCOMPATIBLE_DATA
  | ErrorCode.DOMAIN_RESOURCE_INACTIVE;

export class DomainException extends AppException {
  constructor(errorCode: DomainErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
