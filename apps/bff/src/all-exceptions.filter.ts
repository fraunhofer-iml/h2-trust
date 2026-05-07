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

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

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
        const problemDefinition = PROBLEM_DEFINITIONS[body.errorCode as ErrorCode]
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

      // From the interceptor: HttpException wrapping an RpcError body
      if (isRpcError(body)) {
        const problemDefinition = PROBLEM_DEFINITIONS[body.errorCode as ErrorCode]
          ?? PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];

        const detail = body.errorCode === ErrorCode.INTERNAL_ERROR
          ? 'An internal error occurred'
          : body.message;

        const validationErrors = body.validationErrors?.length
          ? { validationErrors: body.validationErrors }
          : {};

        return {
          type: this.toTypeUri(body.errorCode),
          title: problemDefinition.title,
          detail,
          status: problemDefinition.httpStatus,
          instance,
          timestamp,
          ...validationErrors,
        };
      }

      // BFF-native: BadRequestException from the ValidationPipe
      if (exception instanceof BadRequestException) {
        const problemDefinition = PROBLEM_DEFINITIONS[ErrorCode.VALIDATION_ERROR];

        // ValidationPipe sets body.message to a string[] of per-field errors — extract it if present.
        const fieldErrors = Array.isArray((body as any).message)
          ? (body as any).message
          : undefined;
        const validationErrors = fieldErrors ? { validationErrors: fieldErrors } : {};

        return {
          type: this.toTypeUri(ErrorCode.VALIDATION_ERROR),
          title: problemDefinition.title,
          detail: 'Validation failed',
          status: problemDefinition.httpStatus,
          instance,
          timestamp,
          ...validationErrors,
        };
      }

      // BFF-native: other HttpExceptions from Guards, Controllers, etc.
      const status = exception.getStatus();

      const detail = typeof body === 'string'
        ? body
        : ((body as any)?.message ?? 'An error occurred');

      return {
        type: this.toTypeUri(`http-${status}`),
        title: exception.constructor.name.replace(/Exception$/, ''),
        detail,
        status,
        instance,
        timestamp,
      };
    }

    // Should not occur after the interceptor has run
    this.logger.error(`Unexpected exception: ${exception}`);
    const problemDefinition = PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];

    return {
      type: this.toTypeUri(ErrorCode.INTERNAL_ERROR),
      title: problemDefinition.title,
      detail: 'An internal error occurred',
      status: problemDefinition.httpStatus,
      instance,
      timestamp,
    };
  }

  private toTypeUri(errorCode: string): string {
    return `https://problems.h2-trust.com/${errorCode.toLowerCase().replace(/_/g, '-')}`;
  }
}
