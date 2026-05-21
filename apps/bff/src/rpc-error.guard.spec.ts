/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ErrorCode } from '@h2-trust/exceptions';
import type { RpcError } from '@h2-trust/messaging';
import { extractRpcError, isRpcError } from './rpc-error.guard';

describe('rpc-error.guard', () => {
  it('should be defined', () => {
    expect(extractRpcError).toBeDefined();
    expect(isRpcError).toBeDefined();
  });

  describe('isRpcError', () => {
    it('returns true for a valid rpc error object', () => {
      const rpcError: RpcError = {
        errorCode: ErrorCode.DATABASE_RECORD_NOT_FOUND,
        message: 'Not found',
      };

      expect(isRpcError(rpcError)).toBe(true);
    });

    it('returns false for values without a string error code', () => {
      expect(isRpcError(null)).toBe(false);
      expect(isRpcError(undefined)).toBe(false);
      expect(isRpcError({})).toBe(false);
      expect(isRpcError({ errorCode: 123 })).toBe(false);
    });
  });

  describe('extractRpcError', () => {
    it('returns the error when it already matches the rpc error shape', () => {
      const rpcError: RpcError = {
        errorCode: ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        message: 'Business rule violated',
      };

      expect(extractRpcError(rpcError)).toEqual(rpcError);
    });

    it('unwraps the nested transport error payload', () => {
      const rpcError: RpcError = {
        errorCode: ErrorCode.STORAGE_TIMEOUT,
        message: 'Timed out',
      };

      expect(extractRpcError({ error: rpcError })).toEqual(rpcError);
    });

    it('falls back to an internal error when the payload is not recognized', () => {
      expect(extractRpcError(new Error('boom'))).toEqual({
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      });
    });
  });
});