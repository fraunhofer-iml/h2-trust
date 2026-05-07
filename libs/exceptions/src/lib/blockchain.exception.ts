/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BlockchainErrorCode, InfrastructureException } from './infrastructure.exception';

export class BlockchainException extends InfrastructureException {
  constructor(errorCode: BlockchainErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
