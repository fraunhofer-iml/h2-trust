import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export class ValidationException extends AppException {
  constructor(
    message: string,
    public readonly validationErrors?: string[],
    cause?: unknown,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, cause);
  }
}
