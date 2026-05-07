/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCode } from './error-codes';
import { DatabaseErrorCode, InfrastructureException } from './infrastructure.exception';

export class DatabaseException extends InfrastructureException {
  constructor(errorCode: DatabaseErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}

export class RecordNotFoundException extends DatabaseException {
  constructor(message: string, cause?: unknown) {
    super(ErrorCode.RECORD_NOT_FOUND, message, cause);
  }
}
