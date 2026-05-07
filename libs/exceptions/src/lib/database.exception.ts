/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export type DatabaseErrorCode =
  | ErrorCode.DATABASE_ERROR
  | ErrorCode.DATABASE_CONSTRAINT
  | ErrorCode.DATABASE_RECORD_NOT_FOUND
  | ErrorCode.DATABASE_RECORD_CONFLICT;

export class DatabaseException extends AppException {
  constructor(errorCode: DatabaseErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}

export class RecordNotFoundException extends DatabaseException {
  constructor(message: string, cause?: unknown) {
    super(ErrorCode.DATABASE_RECORD_NOT_FOUND, message, cause);
  }
}
