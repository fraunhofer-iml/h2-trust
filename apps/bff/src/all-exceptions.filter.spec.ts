/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArgumentsHost, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { ErrorCode } from '@h2-trust/exceptions';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { PROBLEM_TYPES } from './problem-types';

describe('AllExceptionsFilter', () => {
  const createHost = (path = '/test') => {
    const response = {
      header: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const request = { path };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ArgumentsHost;

    return { host, response };
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(new AllExceptionsFilter()).toBeDefined();
  });

  it('should map RPC error responses to problem details when catching a bad request exception with RPC payload', () => {
    // arrange
    const givenFilter = new AllExceptionsFilter();
    const { host: givenHost, response: givenResponse } = createHost('/rpc-error');
    const givenException = {
      getResponse: () => ({
        errorCode: ErrorCode.DATABASE_RECORD_NOT_FOUND,
        message: 'Company not found',
        validationErrors: ['id must be a uuid'],
      }),
    } as BadRequestException;
    Object.setPrototypeOf(givenException, BadRequestException.prototype);

    // act
    givenFilter.catch(givenException, givenHost);

    // assert
    expect(givenResponse.header).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(givenResponse.status).toHaveBeenCalledWith(PROBLEM_TYPES[ErrorCode.DATABASE_RECORD_NOT_FOUND].status);
    expect(givenResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'urn:h2-trust:problem:database-record-not-found',
        status: PROBLEM_TYPES[ErrorCode.DATABASE_RECORD_NOT_FOUND].status,
        title: PROBLEM_TYPES[ErrorCode.DATABASE_RECORD_NOT_FOUND].title,
        detail: 'Company not found',
        instance: '/rpc-error',
        validationErrors: ['id must be a uuid'],
      }),
    );
  });

  it('should map validation pipe errors to problem details when catching a validation exception array', () => {
    // arrange
    const givenFilter = new AllExceptionsFilter();
    const { host: givenHost, response: givenResponse } = createHost('/validation');

    // act
    givenFilter.catch(new BadRequestException(['name should not be empty']), givenHost);

    // assert
    expect(givenResponse.status).toHaveBeenCalledWith(PROBLEM_TYPES[ErrorCode.VALIDATION_ERROR].status);
    expect(givenResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'urn:h2-trust:problem:validation-error',
        detail: 'Validation failed',
        instance: '/validation',
        validationErrors: ['name should not be empty'],
      }),
    );
  });

  it('should map native HTTP exceptions to about:blank problem details when catching a framework exception', () => {
    // arrange
    const givenFilter = new AllExceptionsFilter();
    const { host: givenHost, response: givenResponse } = createHost('/native');

    // act
    givenFilter.catch(new ConflictException('Already exists'), givenHost);

    // assert
    expect(givenResponse.status).toHaveBeenCalledWith(409);
    expect(givenResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'about:blank',
        status: 409,
        title: 'Conflict',
        detail: 'Already exists',
        instance: '/native',
      }),
    );
  });

  it('should map unexpected exceptions to an internal problem detail when catching an unknown error', () => {
    // arrange
    const givenFilter = new AllExceptionsFilter();
    const { host: givenHost, response: givenResponse } = createHost('/unexpected');
    const givenLoggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    // act
    givenFilter.catch(new Error('boom'), givenHost);

    // assert
    expect(givenLoggerSpy).toHaveBeenCalledWith('Unexpected exception: Error: boom');
    expect(givenResponse.status).toHaveBeenCalledWith(PROBLEM_TYPES[ErrorCode.INTERNAL_ERROR].status);
    expect(givenResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'urn:h2-trust:problem:internal-error',
        detail: 'An internal error occurred',
        instance: '/unexpected',
      }),
    );
  });
});
