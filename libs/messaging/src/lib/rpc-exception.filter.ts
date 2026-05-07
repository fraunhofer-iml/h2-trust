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
    if (exception instanceof ValidationException) {
      return {
        errorCode: exception.errorCode,
        message: exception.message,
        validationErrors: exception.validationErrors,
      };
    }
    if (exception instanceof InternalException) {
      this.logger.error(exception.message, exception.cause);
      return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
    }
    if (exception instanceof AppException) {
      return { errorCode: exception.errorCode, message: exception.message };
    }
    if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as any;
      const errors = Array.isArray(res.message) ? res.message : [];
      return { errorCode: ErrorCode.VALIDATION_ERROR, message: 'Validation failed', validationErrors: errors };
    }
    if (exception instanceof RpcException) {
      const err = exception.getError();
      if (typeof err === 'object' && err !== null && 'errorCode' in err && typeof (err as any).errorCode === 'string') {
        return err as RpcError;
      }
      this.logger.error(err);
      return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
    }
    this.logger.error(exception);
    return { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };
  }
}
