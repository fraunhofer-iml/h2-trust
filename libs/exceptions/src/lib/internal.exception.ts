import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

export class InternalException extends AppException {
  constructor(message: string, cause?: unknown) {
    super(ErrorCode.INTERNAL_ERROR, message, cause);
  }
}
