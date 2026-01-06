/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { Observable, throwError } from 'rxjs';
import { BrokerException } from './broker/broker-exception';

interface ErrorDetails {
  message: string;
  status: number;
  validationErrors: string[];
}

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('RpcExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): Observable<never> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();
    const pattern = this.extractMessagePattern(ctx.getContext());
    const errorDetails = this.extractErrorDetails(exception);

    this.logError(pattern, errorDetails, data);

    return throwError(() => exception);
  }

  private extractMessagePattern(context: any): string {
    if (!context?.args?.[0]?.content) {
      return 'unknown';
    }

    const content = context.args[0].content;
    if (!Buffer.isBuffer(content)) {
      return 'unknown';
    }

    try {
      const message = JSON.parse(content.toString());
      return message.pattern || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private extractErrorDetails(exception: unknown): ErrorDetails {
    if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      return this.extractFromPrismaError(exception);
    }

    // errors from business logic
    if (exception instanceof BrokerException) {
      return this.extractFromBrokerException(exception);
    }

    // errors from ValidationPipe
    if (exception instanceof BadRequestException) {
      return this.extractFromBadRequestException(exception);
    }

    // errors from other microservices
    if (exception instanceof RpcException) {
      return this.extractFromRpcException(exception);
    }

    // Generic Error
    if (exception instanceof Error) {
      return {
        message: exception.message,
        status: 500,
        validationErrors: [],
      };
    }

    // Unknown exception type
    return {
      message: String(exception),
      status: 500,
      validationErrors: [],
    };
  }

  private extractFromPrismaError(error: Error): ErrorDetails {
    const parsedMessage = error.message
      .replace(/\n/g, ' ') // Remove new lines
      .replace(/[ \t]+/g, ' ') // Remove multiple spaces
      .replace(/"/g, "'"); // Replace double quotes with single quotes

    return {
      message: parsedMessage,
      status: HttpStatus.BAD_REQUEST,
      validationErrors: [],
    };
  }

  private extractFromBrokerException(exception: BrokerException): ErrorDetails {
    const errorObject = exception.getError();

    if (typeof errorObject === 'string') {
      return {
        message: errorObject,
        status: 500,
        validationErrors: [],
      };
    }

    if (typeof errorObject === 'object' && errorObject !== null) {
      const error = errorObject as any;
      return {
        message: error.message || JSON.stringify(error),
        status: error.status || error.statusCode || 500,
        validationErrors: [],
      };
    }

    return {
      message: 'Unknown broker error',
      status: 500,
      validationErrors: [],
    };
  }

  private extractFromBadRequestException(exception: BadRequestException): ErrorDetails {
    const response = exception.getResponse() as any;
    const status = exception.getStatus();

    if (typeof response === 'object' && response.message) {
      if (Array.isArray(response.message)) {
        return {
          message: response.error || 'Validation failed',
          status,
          validationErrors: response.message,
        };
      }
      return {
        message: response.message,
        status,
        validationErrors: [],
      };
    }

    return {
      message: exception.message,
      status,
      validationErrors: [],
    };
  }

  private extractFromRpcException(exception: RpcException): ErrorDetails {
    const errorObject = exception.getError();

    if (typeof errorObject === 'string') {
      return {
        message: errorObject,
        status: 500,
        validationErrors: [],
      };
    }

    if (typeof errorObject === 'object' && errorObject !== null) {
      const error = errorObject as any;
      const status = error.status || error.statusCode || 500;

      if (Array.isArray(error.message)) {
        return {
          message: error.error || 'Validation failed',
          status,
          validationErrors: error.message,
        };
      }

      return {
        message: error.message || JSON.stringify(error),
        status,
        validationErrors: [],
      };
    }

    return {
      message: 'Unknown RPC error',
      status: 500,
      validationErrors: [],
    };
  }

  private logError(pattern: string, errorDetails: ErrorDetails, data: unknown): void {
    let logMessage = `[${pattern}] ${errorDetails.message} (Status: ${errorDetails.status})`;

    if (errorDetails.validationErrors.length > 0) {
      logMessage += `\nValidation errors:\n  - ${errorDetails.validationErrors.join('\n  - ')}`;
    }

    if (data) {
      logMessage += `\nPayload: ${JSON.stringify(data)}`;
    }

    this.logger.error(logMessage);
  }
}
