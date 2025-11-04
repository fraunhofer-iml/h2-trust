/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HttpStatus } from '@nestjs/common';
import { BrokerException } from '@h2-trust/amqp';

export function assertRecordFound(fetchedRecord: any, id: string, record = 'Record') {
  if (!fetchedRecord) {
    throw new BrokerException(`${record} with ID '${id}' not found.`, HttpStatus.NOT_FOUND);
  }
  return fetchedRecord;
}
