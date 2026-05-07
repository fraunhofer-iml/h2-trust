/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '@h2-trust/exceptions';
import { isRpcError, PROBLEM_DEFINITIONS, ProblemResponse } from './problem-definitions';
import type { RpcError } from '@h2-trust/messaging';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response
      .header('Content-Type', 'application/problem+json')
      .status(this.resolveStatus(exception))
      .json(this.toProblemResponse(exception, request.path));
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      if (isRpcError(body)) {
        const problemDefinition = PROBLEM_DEFINITIONS[body.errorCode]
          ?? PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];
        return problemDefinition.httpStatus;
      }

      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private toProblemResponse(exception: unknown, instance: string): ProblemResponse {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      if (isRpcError(body)) {
        return this.rpcErrorToProblemResponse(body, instance, timestamp);
      }

      if (exception instanceof BadRequestException) {
        return this.validationPipeToProblemResponse(body, instance, timestamp);
      }

      return this.nativeHttpExceptionToProblemResponse(exception, body, instance, timestamp);
    }

    return this.unexpectedExceptionToProblemResponse(exception, instance, timestamp);
  }

  // From the interceptor: HttpException wrapping an RpcError body
  private rpcErrorToProblemResponse(rpcError: RpcError, instance: string, timestamp: string): ProblemResponse {
    const problemDefinition = PROBLEM_DEFINITIONS[rpcError.errorCode]
      ?? PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];

    const type = this.toTypeUri(rpcError.errorCode);
    const title = problemDefinition.title;
    const detail = rpcError.errorCode === ErrorCode.INTERNAL_ERROR
      ? 'An internal error occurred'
      : rpcError.message;
    const status = problemDefinition.httpStatus;

    const validationErrors = rpcError.validationErrors?.length
      ? { validationErrors: rpcError.validationErrors }
      : {};

    return {
      type,
      title,
      detail,
      status,
      instance,
      timestamp,
      ...validationErrors,
    };
  }

  // BFF-native: BadRequestException from the ValidationPipe
  private validationPipeToProblemResponse(body: unknown, instance: string, timestamp: string): ProblemResponse {
    const type = this.toTypeUri(ErrorCode.VALIDATION_ERROR);
    const title = PROBLEM_DEFINITIONS[ErrorCode.VALIDATION_ERROR].title;
    const detail = 'Validation failed';
    const status = PROBLEM_DEFINITIONS[ErrorCode.VALIDATION_ERROR].httpStatus;

    // ValidationPipe sets body.message to a string[] of per-field errors — extract it if present.
    const fieldErrors = Array.isArray((body as any).message) ? (body as any).message : undefined;
    const validationErrors = fieldErrors ? { validationErrors: fieldErrors } : {};

    return {
      type,
      title,
      detail,
      status,
      instance,
      timestamp,
      ...validationErrors,
    };
  }

  // BFF-native: other HttpExceptions from Guards, Controllers, etc.
  private nativeHttpExceptionToProblemResponse(exception: HttpException, body: unknown, instance: string, timestamp: string): ProblemResponse {
    const type = this.toTypeUri(`http-${exception.getStatus()}`);
    const title = exception.constructor.name.replace(/Exception$/, '');
    const detail = typeof body === 'string' ? body : ((body as any)?.message ?? 'An error occurred');
    const status = exception.getStatus();

    return {
      type,
      title,
      detail,
      status,
      instance,
      timestamp,
    };
  }

  // Should not occur after the interceptor has run
  private unexpectedExceptionToProblemResponse(exception: unknown, instance: string, timestamp: string): ProblemResponse {
    this.logger.error(`Unexpected exception: ${exception}`);

    const type = this.toTypeUri(ErrorCode.INTERNAL_ERROR);
    const title = PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR].title;
    const status = PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR].httpStatus;
    const detail = 'An internal error occurred';

    return {
      type,
      title,
      detail,
      status,
      instance,
      timestamp,
    };
  }

  private toTypeUri(slug: string): string {
    return `https://problems.h2-trust.com/${slug.toLowerCase().replace(/_/g, '-')}`;
  }
}
