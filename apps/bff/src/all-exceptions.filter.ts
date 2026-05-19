/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProblemDetail } from '@h2-trust/contracts/dtos';
import { ErrorCode } from '@h2-trust/exceptions';
import type { RpcError } from '@h2-trust/messaging';
import { PROBLEM_TYPES } from './problem-types';
import { isRpcError } from './rpc-error.guard';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const problemDetail = this.toProblemDetail(exception, ctx.getRequest<Request>().path);

    ctx
      .getResponse<Response>()
      .header('Content-Type', 'application/problem+json')
      .status(problemDetail.status)
      .json(problemDetail);
  }

  private toProblemDetail(exception: unknown, instance: string): ProblemDetail {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      if (isRpcError(body)) {
        // From the interceptor: HttpException wrapping an RpcError body
        return this.rpcErrorToProblemDetail(body, instance, timestamp);
      }

      if (exception instanceof BadRequestException) {
        // BFF-native: BadRequestException from the ValidationPipe
        return this.validationPipeToProblemDetail(body, instance, timestamp);
      }

      // BFF-native: other HttpExceptions from Guards, Controllers, etc.
      return this.nativeHttpExceptionToProblemDetail(exception, body, instance, timestamp);
    }

    // Should not occur after the interceptor has run
    return this.unexpectedExceptionToProblemDetail(exception, instance, timestamp);
  }

  private rpcErrorToProblemDetail(rpcError: RpcError, instance: string, timestamp: string): ProblemDetail {
    const problemType = PROBLEM_TYPES[rpcError.errorCode] ?? PROBLEM_TYPES[ErrorCode.INTERNAL_ERROR];

    const type = this.toTypeUri(rpcError.errorCode);
    const status = problemType.status;
    const title = problemType.title;
    const detail = rpcError.errorCode === ErrorCode.INTERNAL_ERROR ? 'An internal error occurred' : rpcError.message;

    const validationErrors = rpcError.validationErrors?.length ? { validationErrors: rpcError.validationErrors } : {};

    return {
      type,
      status,
      title,
      detail,
      instance,
      timestamp,
      ...validationErrors,
    };
  }

  private validationPipeToProblemDetail(body: unknown, instance: string, timestamp: string): ProblemDetail {
    const type = this.toTypeUri(ErrorCode.VALIDATION_ERROR);
    const status = PROBLEM_TYPES[ErrorCode.VALIDATION_ERROR].status;
    const title = PROBLEM_TYPES[ErrorCode.VALIDATION_ERROR].title;
    const detail = 'Validation failed';

    // ValidationPipe sets body.message to a string[] of per-field errors
    const fieldErrors = Array.isArray((body as any).message) ? (body as any).message : undefined;
    const validationErrors = fieldErrors ? { validationErrors: fieldErrors } : {};

    return {
      type,
      status,
      title,
      detail,
      instance,
      timestamp,
      ...validationErrors,
    };
  }

  private nativeHttpExceptionToProblemDetail(
    exception: HttpException,
    body: unknown,
    instance: string,
    timestamp: string,
  ): ProblemDetail {
    // about:blank signals no additional semantics beyond the HTTP status code (RFC 9457 §3.1.1)
    const type = 'about:blank';
    const status = exception.getStatus();
    const title = exception.constructor.name.replace(/Exception$/, '');
    const detail = typeof body === 'string' ? body : ((body as any)?.message ?? 'An error occurred');

    return {
      type,
      status,
      title,
      detail,
      instance,
      timestamp,
    };
  }

  private unexpectedExceptionToProblemDetail(exception: unknown, instance: string, timestamp: string): ProblemDetail {
    this.logger.error(`Unexpected exception: ${exception}`);

    const type = this.toTypeUri(ErrorCode.INTERNAL_ERROR);
    const status = PROBLEM_TYPES[ErrorCode.INTERNAL_ERROR].status;
    const title = PROBLEM_TYPES[ErrorCode.INTERNAL_ERROR].title;
    const detail = 'An internal error occurred';

    return {
      type,
      status,
      title,
      detail,
      instance,
      timestamp,
    };
  }

  private toTypeUri(slug: string): string {
    return `urn:h2-trust:problem:${slug.toLowerCase().replace(/_/g, '-')}`;
  }
}
