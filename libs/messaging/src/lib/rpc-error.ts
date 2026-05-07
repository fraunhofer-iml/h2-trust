import { ErrorCode } from '@h2-trust/exceptions';

export interface RpcError {
  errorCode: ErrorCode;
  message: string;
  validationErrors?: string[];
}
