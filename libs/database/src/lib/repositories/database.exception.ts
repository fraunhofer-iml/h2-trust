import { DatabaseErrorCode, InfrastructureException } from '@h2-trust/exceptions';
import { ErrorCode } from '@h2-trust/exceptions';

export class DatabaseException extends InfrastructureException {
  constructor(errorCode: DatabaseErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}

export class RecordNotFoundException extends DatabaseException {
  constructor(message: string, cause?: unknown) {
    super(ErrorCode.RECORD_NOT_FOUND, message, cause);
  }
}
