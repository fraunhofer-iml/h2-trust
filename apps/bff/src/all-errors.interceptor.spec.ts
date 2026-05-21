/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CallHandler, ExecutionContext, HttpException, NotFoundException } from '@nestjs/common';
import { lastValueFrom, throwError } from 'rxjs';
import { ErrorCode } from '@h2-trust/exceptions';
import { PROBLEM_TYPES } from './problem-types';
import { AllErrorsInterceptor } from './all-errors.interceptor';

describe('AllErrorsInterceptor', () => {
  const givenExecutionContext = {} as ExecutionContext;

  it('should be defined', () => {
    expect(new AllErrorsInterceptor()).toBeDefined();
  });

  it('should pass through native HttpExceptions when the call handler throws one', async () => {
    // arrange
    const givenInterceptor = new AllErrorsInterceptor();
    const givenHttpException = new NotFoundException('Missing');
    const givenCallHandler: CallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => givenHttpException)),
    };

    // act
    const actualResult = lastValueFrom(givenInterceptor.intercept(givenExecutionContext, givenCallHandler));

    // assert
    await expect(actualResult).rejects.toBe(givenHttpException);
  });

  it('should wrap RPC errors into an HttpException when the call handler throws an RPC payload', async () => {
    // arrange
    const givenInterceptor = new AllErrorsInterceptor();
    const givenRpcError = {
      errorCode: ErrorCode.DOMAIN_RESOURCE_INACTIVE,
      message: 'Resource inactive',
    };
    const givenCallHandler: CallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => ({ error: givenRpcError }))),
    };

    // act
    const actualResult = lastValueFrom(givenInterceptor.intercept(givenExecutionContext, givenCallHandler));

    // assert
    await expect(actualResult).rejects.toEqual(
      expect.objectContaining<HttpException>({
        response: givenRpcError,
        status: PROBLEM_TYPES[ErrorCode.DOMAIN_RESOURCE_INACTIVE].status,
      }),
    );
  });

  it('should fall back to an internal error when the thrown value is not an RPC error', async () => {
    // arrange
    const givenInterceptor = new AllErrorsInterceptor();
    const givenCallHandler: CallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => new Error('boom'))),
    };

    // act
    const actualResult = lastValueFrom(givenInterceptor.intercept(givenExecutionContext, givenCallHandler));

    // assert
    await expect(actualResult).rejects.toEqual(
      expect.objectContaining<HttpException>({
        response: {
          errorCode: ErrorCode.INTERNAL_ERROR,
          message: 'Internal server error',
        },
        status: PROBLEM_TYPES[ErrorCode.INTERNAL_ERROR].status,
      }),
    );
  });
});