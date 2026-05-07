import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export type StorageErrorCode =
  | ErrorCode.STORAGE_UPLOAD_FAILED
  | ErrorCode.STORAGE_DOWNLOAD_FAILED
  | ErrorCode.STORAGE_TIMEOUT;

export type BlockchainErrorCode =
  | ErrorCode.BLOCKCHAIN_NOT_INITIALIZED
  | ErrorCode.BLOCKCHAIN_STORE_FAILED
  | ErrorCode.BLOCKCHAIN_RETRIEVE_FAILED;

export type DatabaseErrorCode =
  | ErrorCode.DATABASE_ERROR
  | ErrorCode.DATABASE_CONSTRAINT
  | ErrorCode.RECORD_NOT_FOUND
  | ErrorCode.RECORD_CONFLICT;

export class InfrastructureException extends AppException {}

export class StorageException extends InfrastructureException {
  constructor(errorCode: StorageErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}

export class BlockchainException extends InfrastructureException {
  constructor(errorCode: BlockchainErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}

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
