import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '@h2-trust/amqp';

export function assertRecordFound(fetchedRecord: any, id: string, record = 'Record') {
  if (!fetchedRecord) {
    throw new BrokerException(`${record} with ID '${id}' not found.`, HttpStatus.NOT_FOUND);
  }
  return fetchedRecord;
}
