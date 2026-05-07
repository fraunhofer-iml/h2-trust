/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorCode } from '@h2-trust/exceptions';
import { RpcError } from '@h2-trust/messaging';
import { isRpcError, PROBLEM_DEFINITIONS } from './problem-definitions';

@Injectable()
export class AllErrorsInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // Pass through BFF-native HttpExceptions (guards, controllers, ValidationPipe).
        // Otherwise the filter branch for native HttpExceptions would never be reached
        // because the body would already have been rewritten to an RpcError.
        if (err instanceof HttpException) {
          throw err;
        }

        const rpcError: RpcError = isRpcError(err)
          ? err
          : { errorCode: ErrorCode.INTERNAL_ERROR, message: 'Internal server error' };

        const problemDefinition =
          PROBLEM_DEFINITIONS[rpcError.errorCode as ErrorCode] ?? PROBLEM_DEFINITIONS[ErrorCode.INTERNAL_ERROR];

        throw new HttpException(rpcError, problemDefinition.httpStatus);
      }),
    );
  }
}
