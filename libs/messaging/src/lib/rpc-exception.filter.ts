/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { ErrorCode } from '@h2-trust/exceptions';
import { RpcError } from './rpc-error';

const KNOWN_ERROR_CODES = new Set<string>(Object.values(ErrorCode));

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    return throwError(() => new RpcException(this.toRpcError(exception)));
  }

  private toRpcError(exception: unknown): RpcError {
    const appException = exception as Record<string, unknown>;
    const errorCode = appException?.['errorCode'];

    // Duck-typed AppException check: reliable across webpack bundle instances where instanceof may fail.
    // All AppException subclasses carry a string errorCode matching a known ErrorCode value.
    if (typeof errorCode === 'string' && KNOWN_ERROR_CODES.has(errorCode)) {
      const message = typeof appException['message'] === 'string' ? appException['message'] : 'Unknown error';
      const cause: unknown = appException['cause'];
      const validationErrors = Array.isArray(appException['validationErrors'])
        ? (appException['validationErrors'] as string[])
        : undefined;

      // Manually thrown ValidationException — validationErrors already structured
      if (errorCode === ErrorCode.VALIDATION_ERROR) {
        this.logger.warn(message, validationErrors);
        return { errorCode: ErrorCode.VALIDATION_ERROR, message, validationErrors };
      }

      // InternalException signals a bug or violated invariant — cause logged, never forwarded to client
      if (errorCode === ErrorCode.INTERNAL_ERROR) {
        this.logger.error(message, cause);
        return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
      }

      // All other AppException subtypes (DatabaseException, DomainException, StorageException, etc.)
      this.logger.error(message, cause);
      return { errorCode: errorCode as ErrorCode, message };
    }

    // Thrown by the NestJS ValidationPipe (not under our control)
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as { message?: unknown };
      const errors = Array.isArray(response.message) ? (response.message as string[]) : [];
      this.logger.warn(exception.message, errors);
      return { errorCode: ErrorCode.VALIDATION_ERROR, message: 'Validation failed', validationErrors: errors };
    }

    // RpcException from an inner microservice call
    if (exception instanceof RpcException) {
      const err = exception.getError();

      if (typeof err === 'object' && err !== null && 'errorCode' in err && typeof (err as Record<string, unknown>)['errorCode'] === 'string') {
        return err as RpcError;
      }

      this.logger.error(err);
      return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
    }

    // Uncaught runtime error that is not an AppException
    this.logger.error(exception);
    return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
  }
}
