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
  const executionContextMock = {} as ExecutionContext;

  it('should be defined', () => {
    expect(new AllErrorsInterceptor()).toBeDefined();
  });

  it('passes through native HttpExceptions unchanged', async () => {
    const interceptor = new AllErrorsInterceptor();
    const httpException = new NotFoundException('Missing');
    const callHandlerMock: CallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => httpException)),
    };

    await expect(lastValueFrom(interceptor.intercept(executionContextMock, callHandlerMock))).rejects.toBe(httpException);
  });

  it('wraps rpc errors into an HttpException with the mapped status code', async () => {
    const interceptor = new AllErrorsInterceptor();
    const rpcError = {
      errorCode: ErrorCode.DOMAIN_RESOURCE_INACTIVE,
      message: 'Resource inactive',
    };
    const callHandlerMock: CallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => ({ error: rpcError }))),
    };

    await expect(lastValueFrom(interceptor.intercept(executionContextMock, callHandlerMock))).rejects.toEqual(
      expect.objectContaining<HttpException>({
        response: rpcError,
        status: PROBLEM_TYPES[ErrorCode.DOMAIN_RESOURCE_INACTIVE].status,
      }),
    );
  });

  it('falls back to an internal error when the thrown value is not an rpc error', async () => {
    const interceptor = new AllErrorsInterceptor();
    const callHandlerMock: CallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => new Error('boom'))),
    };

    await expect(lastValueFrom(interceptor.intercept(executionContextMock, callHandlerMock))).rejects.toEqual(
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