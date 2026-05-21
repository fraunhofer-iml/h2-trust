/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArgumentsHost, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { ErrorCode } from '@h2-trust/exceptions';
import { PROBLEM_TYPES } from './problem-types';
import { AllExceptionsFilter } from './all-exceptions.filter';

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

  it('maps rpc error responses to problem details', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost('/rpc-error');
    const exception = {
      getResponse: () => ({
        errorCode: ErrorCode.DATABASE_RECORD_NOT_FOUND,
        message: 'Company not found',
        validationErrors: ['id must be a uuid'],
      }),
    } as BadRequestException;
    Object.setPrototypeOf(exception, BadRequestException.prototype);

    filter.catch(exception, host);

    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/problem+json');
    expect(response.status).toHaveBeenCalledWith(PROBLEM_TYPES[ErrorCode.DATABASE_RECORD_NOT_FOUND].status);
    expect(response.json).toHaveBeenCalledWith(
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

  it('maps validation pipe errors to validation problem details', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost('/validation');

    filter.catch(new BadRequestException(['name should not be empty']), host);

    expect(response.status).toHaveBeenCalledWith(PROBLEM_TYPES[ErrorCode.VALIDATION_ERROR].status);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'urn:h2-trust:problem:validation-error',
        detail: 'Validation failed',
        instance: '/validation',
        validationErrors: ['name should not be empty'],
      }),
    );
  });

  it('maps native http exceptions to about:blank problem details', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost('/native');

    filter.catch(new ConflictException('Already exists'), host);

    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'about:blank',
        status: 409,
        title: 'Conflict',
        detail: 'Already exists',
        instance: '/native',
      }),
    );
  });

  it('maps unexpected exceptions to an internal problem detail and logs them', () => {
    const filter = new AllExceptionsFilter();
    const { host, response } = createHost('/unexpected');
    const loggerSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('boom'), host);

    expect(loggerSpy).toHaveBeenCalledWith('Unexpected exception: Error: boom');
    expect(response.status).toHaveBeenCalledWith(PROBLEM_TYPES[ErrorCode.INTERNAL_ERROR].status);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'urn:h2-trust:problem:internal-error',
        detail: 'An internal error occurred',
        instance: '/unexpected',
      }),
    );
  });
});