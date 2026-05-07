/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '@h2-trust/exceptions';
import { isRpcError, PROBLEM_DEFINITIONS, ProblemResponse, toTypeUri } from './problem-definitions';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response
      .status(this.resolveStatus(exception))
      .header('Content-Type', 'application/problem+json')
      .json(this.toProblem(exception, request.path));
  }

  private toProblem(exception: unknown, instance: string): ProblemResponse {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const body = exception.getResponse();

      // Vom Interceptor: HttpException mit RpcError-Body
      if (isRpcError(body)) {
        const def = PROBLEM_DEFINITIONS[body.errorCode as ErrorCode] ?? PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];
        return {
          type: toTypeUri(body.errorCode),
          title: def.title,
          detail: body.errorCode === ErrorCode.INTERNAL_ERROR ? 'An internal error occurred' : body.message,
          status: def.httpStatus,
          instance,
          timestamp,
          ...(body.validationErrors?.length ? { validationErrors: body.validationErrors } : {}),
        };
      }

      // BFF-nativ: BadRequestException aus ValidationPipe
      if (exception instanceof BadRequestException) {
        const res = body as any;
        const errors = Array.isArray(res.message) ? res.message : undefined;
        const def = PROBLEM_DEFINITIONS[ErrorCode.VALIDATION_ERROR];
        return {
          type: toTypeUri(ErrorCode.VALIDATION_ERROR),
          title: def.title,
          detail: 'Validation failed',
          status: def.httpStatus,
          instance,
          timestamp,
          ...(errors ? { validationErrors: errors } : {}),
        };
      }

      // BFF-nativ: sonstige HttpException (Guards, Controller) — Status durchreichen
      const status = exception.getStatus();
      const detail = typeof body === 'string' ? body : ((body as any)?.message ?? 'An error occurred');
      return {
        type: `https://problems.h2-trust.com/http-${status}`,
        title: exception.constructor.name.replace(/Exception$/, ''),
        detail: Array.isArray(detail) ? detail.join('; ') : String(detail),
        status,
        instance,
        timestamp,
      };
    }

    // Sollte nach Interceptor nicht vorkommen
    this.logger.error(exception);
    const def = PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];
    return {
      type: toTypeUri(ErrorCode.INTERNAL_ERROR),
      title: def.title,
      detail: 'An internal error occurred',
      status: def.httpStatus,
      instance,
      timestamp,
    };
  }

  private resolveStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (isRpcError(body)) {
        const def = PROBLEM_DEFINITIONS[body.errorCode as ErrorCode] ?? PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];
        return def.httpStatus;
      }
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
