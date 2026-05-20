/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCode } from '@h2-trust/exceptions';
import type { RpcError } from '@h2-trust/messaging';

// NestJS AMQP transport wraps the RpcException payload under .error on the client side
export function extractRpcError(err: unknown): RpcError {
  if (isRpcError(err)) {
    return err;
  }

  const error = (err as { error?: unknown })?.error;

  if (isRpcError(error)) {
    return error;
  }

  return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
}

export function isRpcError(value: unknown): value is RpcError {
  return (
    typeof value === 'object' && value !== null && 'errorCode' in value && typeof (value as Record<string, unknown>)['errorCode'] === 'string'
  );
}
