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
import { AppException, ErrorCode, InternalException, ValidationException } from '@h2-trust/exceptions';
import { RpcError } from './rpc-error';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

  catch(exception: unknown, _host: ArgumentsHost): Observable<never> {
    return throwError(() => new RpcException(this.toRpcError(exception)));
  }

  private toRpcError(exception: unknown): RpcError {
    // Manually thrown from service methods
    if (exception instanceof ValidationException) {
      this.logger.warn(exception.message, exception.validationErrors);
      return {
        errorCode: exception.errorCode,
        message: exception.message,
        validationErrors: exception.validationErrors,
      };
    }

    // Signals a bug or violated invariant
    if (exception instanceof InternalException) {
      this.logger.error(exception.message, exception.cause);
      return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
    }

    // All other AppException subtypes (DatabaseException, DomainException, StorageException, etc.)
    if (exception instanceof AppException) {
      this.logger.error(exception.message, exception.cause);
      return { errorCode: exception.errorCode, message: exception.message };
    }

    // Thrown by the NestJS ValidationPipe (not under our control)
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse() as any;
      const errors = Array.isArray(response.message) ? response.message : [];
      this.logger.warn(exception.message, errors);
      return { errorCode: ErrorCode.VALIDATION_ERROR, message: 'Validation failed', validationErrors: errors };
    }

    if (exception instanceof RpcException) {
      const err = exception.getError();

      // Thrown by another microservice
      if (typeof err === 'object' && err !== null && 'errorCode' in err && typeof (err as any).errorCode === 'string') {
        return err as RpcError;
      }

      // Unknown payload
      this.logger.error(err);
      return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
    }

    // Uncaught runtime error that is not an AppException
    this.logger.error(exception);
    return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
  }
}
