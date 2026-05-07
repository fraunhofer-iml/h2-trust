import { Prisma } from '@prisma/client';
import { ErrorCode } from '@h2-trust/exceptions';
import { DatabaseException, RecordNotFoundException } from './database.exception';

export function wrapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2025':
        throw new RecordNotFoundException('Record not found', error);
      case 'P2002':
        throw new DatabaseException(ErrorCode.RECORD_CONFLICT, 'Unique constraint violation', error);
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
