/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessedCsvDto } from '@h2-trust/contracts/dtos';
import { CsvContentType } from '@h2-trust/domain';

export const ProcessedCsvDtoFixture = {
  create: (overrides: Partial<ProcessedCsvDto> = {}): ProcessedCsvDto => ({
    id: overrides.id ?? 'processed-csv-1',
    url: overrides.url ?? 'https://example.com/files/processed-csv-1.csv',
    name: overrides.name ?? 'processed-csv-1.csv',
    uploadedBy: overrides.uploadedBy ?? 'PowerGen AG',
    startedAt: overrides.startedAt ?? new Date('2025-04-07T08:00:00.000Z'),
    endedAt: overrides.endedAt ?? new Date('2025-04-07T16:00:00.000Z'),
    csvContentType: overrides.csvContentType ?? CsvContentType.HYDROGEN,
    amount: overrides.amount ?? 10,
    verifiable: overrides.verifiable ?? true,
  }),
} as const;
