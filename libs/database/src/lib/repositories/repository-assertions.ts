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
