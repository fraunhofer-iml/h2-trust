/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CsvDocumentEntity } from '@h2-trust/contracts/entities';

export const CsvDocumentEntityFixture = {
  create: (overrides: Partial<CsvDocumentEntity> = {}): CsvDocumentEntity =>
    new CsvDocumentEntity(
      overrides.id ?? 'document-1',
      overrides.fileName ?? 'document-1',
      overrides.type ?? typeof String,
      overrides.startedAt ?? new Date('2026-01-01T00:00:00.000Z'),
      overrides.endedAt ?? new Date('2026-01-01T00:15:00.000Z'),
      overrides.amount ?? 100,
      overrides.transactionHash ?? 'hash-1',
    ),
} as const;
