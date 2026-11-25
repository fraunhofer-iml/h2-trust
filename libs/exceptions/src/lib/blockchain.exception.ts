/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export type BlockchainErrorCode =
  | ErrorCode.BLOCKCHAIN_NOT_INITIALIZED
  | ErrorCode.BLOCKCHAIN_STORE_FAILED
  | ErrorCode.BLOCKCHAIN_RETRIEVE_FAILED;

export class BlockchainException extends AppException {
  constructor(errorCode: BlockchainErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
