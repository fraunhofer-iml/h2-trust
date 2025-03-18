import { HttpStatus } from '@nestjs/common';
import { AmqpException } from '@h2-trust/amqp';

export function retrieveEntityOrThrow(fetchedObject: any, id: string, entity = 'Entity') {
  if (!fetchedObject) {
    throw new AmqpException(`${entity} with ID '${id}' not found.`, HttpStatus.NOT_FOUND);
  }
  return fetchedObject;
}
