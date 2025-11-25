import {BrokerException} from "@h2-trust/amqp";
import {HttpStatus} from "@nestjs/common";

export function assertDefined<T>(value: T | null | undefined, fieldName: string): asserts value is T {
  if (value == null) {
    throw new BrokerException(`${fieldName} was undefined`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
