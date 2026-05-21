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
    it('should return true when the value matches the RPC error shape', () => {
      // arrange
      const givenRpcError: RpcError = {
        errorCode: ErrorCode.DATABASE_RECORD_NOT_FOUND,
        message: 'Not found',
      };

      // act
      const actualResult = isRpcError(givenRpcError);

      // assert
      expect(actualResult).toBe(true);
    });

    it('should return false when the value does not have a string error code', () => {
      // act & assert
      expect(isRpcError(null)).toBe(false);
      expect(isRpcError(undefined)).toBe(false);
      expect(isRpcError({})).toBe(false);
      expect(isRpcError({ errorCode: 123 })).toBe(false);
    });
  });

  describe('extractRpcError', () => {
    it('should return the error when the value already matches the RPC error shape', () => {
      // arrange
      const givenRpcError: RpcError = {
        errorCode: ErrorCode.DOMAIN_BUSINESS_RULE_VIOLATION,
        message: 'Business rule violated',
      };

      // act
      const actualResult = extractRpcError(givenRpcError);

      // assert
      expect(actualResult).toEqual(givenRpcError);
    });

    it('should unwrap the nested transport error payload when the error is wrapped by the transport layer', () => {
      // arrange
      const givenRpcError: RpcError = {
        errorCode: ErrorCode.STORAGE_TIMEOUT,
        message: 'Timed out',
      };

      // act
      const actualResult = extractRpcError({ error: givenRpcError });

      // assert
      expect(actualResult).toEqual(givenRpcError);
    });

    it('should fall back to an internal error when the payload is not recognized', () => {
      // act
      const actualResult = extractRpcError(new Error('boom'));

      // assert
      expect(actualResult).toEqual({
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'Internal server error',
      });
    });
  });
});
