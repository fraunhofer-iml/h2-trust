/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { DatabaseException, ErrorCode } from '@h2-trust/exceptions';

export function wrapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        throw new DatabaseException(ErrorCode.DATABASE_RECORD_NOT_FOUND, 'Record not found', error);
      case 'P2002':
        throw new DatabaseException(ErrorCode.DATABASE_RECORD_CONFLICT, 'Unique constraint violation', error);
      case 'P2003':
        throw new DatabaseException(ErrorCode.DATABASE_CONSTRAINT, 'Foreign key constraint violation', error);
      case 'P2014':
        throw new DatabaseException(ErrorCode.DATABASE_CONSTRAINT, 'Relation constraint violation', error);
      default:
        throw new DatabaseException(ErrorCode.DATABASE_ERROR, 'Database request failed', error);
    }
  }
  if (
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    throw new DatabaseException(ErrorCode.DATABASE_ERROR, 'Database error', error);
  }
  throw error;
}
