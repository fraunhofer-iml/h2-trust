/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCode } from './error-codes';
import { InfrastructureException } from './infrastructure.exception';

export type StorageErrorCode =
  | ErrorCode.STORAGE_UPLOAD_FAILED
  | ErrorCode.STORAGE_DOWNLOAD_FAILED
  | ErrorCode.STORAGE_TIMEOUT;

export class StorageException extends InfrastructureException {
  constructor(errorCode: StorageErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
