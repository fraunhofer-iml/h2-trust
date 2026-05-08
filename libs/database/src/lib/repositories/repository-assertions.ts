/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseException, ErrorCode } from '@h2-trust/exceptions';

export function assertRecordFound<T>(fetchedRecord: T | null | undefined, id: string): asserts fetchedRecord is T {
  if (!fetchedRecord) {
    throw new DatabaseException(ErrorCode.DATABASE_RECORD_NOT_FOUND, `Record with ID [${id}] not found.`);
  }
}

export function assertAllIdsFound<T extends { id: string }>(fetchedRecords: T[], requestedIds: string[]): void {
  const idsFound = new Set(fetchedRecords.map((r) => r.id));
  const idsNotFound = requestedIds.filter((id) => !idsFound.has(id));

  if (idsNotFound.length) {
    throw new DatabaseException(
      ErrorCode.DATABASE_RECORD_NOT_FOUND,
      `Records with IDs [${idsNotFound.join(', ')}] not found.`,
    );
  }
}
