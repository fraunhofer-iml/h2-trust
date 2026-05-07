import { BlockchainErrorCode, InfrastructureException } from '@h2-trust/exceptions';

export class BlockchainException extends InfrastructureException {
  constructor(errorCode: BlockchainErrorCode, message: string, cause?: unknown) {
    super(errorCode, message, cause);
  }
}
