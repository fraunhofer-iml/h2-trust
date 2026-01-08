/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Observable, throwError } from 'rxjs';
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Prisma } from '@prisma/client';
import { BrokerException } from './broker/broker-exception';

interface ErrorDetails {
  message: string;
  status: number;
  validationErrors: string[];
}

interface StructuredError {
  message: string | string[];
  status: number;
  error?: string;
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

    const structuredError = this.buildStructuredError(errorDetails);
    return throwError(() => new RpcException(structuredError));
  }

  private extractMessagePattern(context: any): string {
    let pattern = 'unknown';

    if (context?.args?.[0]?.content) {
      const content = context.args[0].content;

      if (Buffer.isBuffer(content)) {
        try {
          const message = JSON.parse(content.toString());
          pattern = message.pattern || 'unknown';
        } catch {
          // Keep default pattern
        }
      }
    }

    return pattern;
  }

  private extractErrorDetails(exception: unknown): ErrorDetails {
    let errorDetails: ErrorDetails;

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError ||
      exception instanceof Prisma.PrismaClientUnknownRequestError ||
      exception instanceof Prisma.PrismaClientRustPanicError ||
      exception instanceof Prisma.PrismaClientInitializationError ||
      exception instanceof Prisma.PrismaClientValidationError
    ) {
      errorDetails = this.extractFromPrismaError(exception);
    } else if (exception instanceof BrokerException) {
      errorDetails = this.extractFromBrokerException(exception); // Business logic
    } else if (exception instanceof BadRequestException) {
      errorDetails = this.extractFromBadRequestException(exception); // ValidationPipe
    } else if (exception instanceof RpcException) {
      errorDetails = this.extractFromRpcException(exception); // Other microservices
    } else if (exception instanceof Error) {
      // Generic Error
      errorDetails = {
        message: exception.message,
        status: 500,
        validationErrors: [],
      };
    } else {
      // Unknown exception type
      errorDetails = {
        message: String(exception),
        status: 500,
        validationErrors: [],
      };
    }

    return errorDetails;
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
    let errorDetails: ErrorDetails;

    if (typeof errorObject === 'string') {
      errorDetails = {
        message: errorObject,
        status: 500,
        validationErrors: [],
      };
    } else if (typeof errorObject === 'object' && errorObject !== null) {
      const error = errorObject as any;
      errorDetails = {
        message: error.message || JSON.stringify(error),
        status: error.status || error.statusCode || 500,
        validationErrors: [],
      };
    } else {
      errorDetails = {
        message: 'Unknown broker error',
        status: 500,
        validationErrors: [],
      };
    }

    return errorDetails;
  }

  private extractFromBadRequestException(exception: BadRequestException): ErrorDetails {
    const response = exception.getResponse() as any;
    const status = exception.getStatus();
    let errorDetails: ErrorDetails;

    if (typeof response === 'object' && response.message) {
      if (Array.isArray(response.message)) {
        errorDetails = {
          message: response.error || 'Validation failed',
          status,
          validationErrors: response.message,
        };
      } else {
        errorDetails = {
          message: response.message,
          status,
          validationErrors: [],
        };
      }
    } else {
      errorDetails = {
        message: exception.message,
        status,
        validationErrors: [],
      };
    }

    return errorDetails;
  }

  private extractFromRpcException(exception: RpcException): ErrorDetails {
    const errorObject = exception.getError();
    let errorDetails: ErrorDetails;

    if (typeof errorObject === 'string') {
      errorDetails = {
        message: errorObject,
        status: 500,
        validationErrors: [],
      };
    } else if (typeof errorObject === 'object' && errorObject !== null) {
      const error = errorObject as any;
      const status = error.status || error.statusCode || 500;

      if (Array.isArray(error.message)) {
        errorDetails = {
          message: error.error || 'Validation failed',
          status,
          validationErrors: error.message,
        };
      } else {
        errorDetails = {
          message: error.message || JSON.stringify(error),
          status,
          validationErrors: [],
        };
      }
    } else {
      errorDetails = {
        message: 'Unknown RPC error',
        status: 500,
        validationErrors: [],
      };
    }

    return errorDetails;
  }

  private logError(pattern: string, errorDetails: ErrorDetails, data: unknown): void {
    let logMessage = `[${pattern}] ${errorDetails.message} (Status: ${errorDetails.status})`;

    if (errorDetails.validationErrors.length > 0) {
      logMessage += `\nValidation errors:\n - ${errorDetails.validationErrors.join('\n - ')}`;
    }

    if (data) {
      logMessage += `\nPayload: ${JSON.stringify(data)}`;
    }

    this.logger.error(logMessage);
  }

  private buildStructuredError(errorDetails: ErrorDetails): StructuredError {
    return errorDetails.validationErrors.length > 0
      ? {
          message: errorDetails.validationErrors,
          status: errorDetails.status,
          error: errorDetails.message,
        }
      : {
          message: errorDetails.message,
          status: errorDetails.status,
        };
  }
}
