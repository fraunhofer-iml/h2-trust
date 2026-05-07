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
