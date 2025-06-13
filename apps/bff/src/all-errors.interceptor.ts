/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CallHandler, ExecutionContext, HttpException, Injectable, NestInterceptor } from '@nestjs/common';

@Injectable()
export class AllErrorsInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        let message = err?.response?.message ?? err?.message ?? 'Internal server error';

        if (Array.isArray(message)) {
          message = message.join('; ');
        }

        const status = err?.status ?? 500;
        throw new HttpException(message, status);
      }),
    );
  }
}
