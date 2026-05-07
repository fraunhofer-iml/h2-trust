/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import type { RpcError } from '@h2-trust/messaging';

export function isRpcError(value: unknown): value is RpcError {
  return (
    typeof value === 'object' && value !== null && 'errorCode' in value && typeof (value as any).errorCode === 'string'
  );
}
