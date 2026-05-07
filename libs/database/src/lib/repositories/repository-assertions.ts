/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecordNotFoundException } from './database.exception';

export function assertRecordFound<T>(
  fetchedRecord: T | null | undefined,
  id: string,
  entityLabel = 'Record',
): asserts fetchedRecord is T {
  if (!fetchedRecord) {
    throw new RecordNotFoundException(`${entityLabel} with ID '${id}' not found.`);
  }
}

export function assertAllIdsFound<T extends { id: string }>(
  fetchedRecords: T[],
  requestedIds: string[],
  entityLabel = 'Records',
): void {
  const foundIds = fetchedRecords.map((u) => u.id);
  const notFound = requestedIds.filter((id) => !foundIds.includes(id));
  if (notFound.length) {
    throw new RecordNotFoundException(`${entityLabel} [${notFound.join(', ')}] not found.`);
  }
}
