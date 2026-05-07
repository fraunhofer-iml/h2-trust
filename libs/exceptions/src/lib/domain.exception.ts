import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export type DomainErrorCode =
  | ErrorCode.BUSINESS_RULE_VIOLATION
  | ErrorCode.INCOMPATIBLE_DATA
  | ErrorCode.RESOURCE_INACTIVE;

export class DomainException extends AppException {
  constructor(errorCode: DomainErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
