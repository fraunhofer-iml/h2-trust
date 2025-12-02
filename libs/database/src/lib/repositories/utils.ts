/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '@h2-trust/amqp';

export function assertRecordFound(fetchedRecord: any, id: string, entityLabel = 'Record') {
  if (!fetchedRecord) {
    throw new BrokerException(`${entityLabel} with ID '${id}' not found.`, HttpStatus.NOT_FOUND);
  }
  return fetchedRecord;
}

export function assertAllIdsFound<T extends { id: string }>(
  fetchedRecords: T[],
  requestedIds: string[],
  entityLabel = 'Records',
): void {
  const foundIds = fetchedRecords.map((u) => u.id);
  const notFound = requestedIds.filter((id) => !foundIds.includes(id));
  if (notFound.length) {
    throw new BrokerException(`${entityLabel} [${notFound.join(', ')}] not found.`, HttpStatus.NOT_FOUND);
  }
}
