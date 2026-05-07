import { InfrastructureException, StorageErrorCode } from '@h2-trust/exceptions';

export class StorageException extends InfrastructureException {
  constructor(errorCode: StorageErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
