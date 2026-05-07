import { ErrorCode } from './error-codes';

export class AppException extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
