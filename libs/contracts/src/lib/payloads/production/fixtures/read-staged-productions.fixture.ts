/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReadStagedProductionsPayload } from '@h2-trust/contracts/payloads';
import { CsvContentType, StagingScope } from '@h2-trust/domain';

export const ReadStagedProductionsPayloadFixture = {
  create: (overrides: Partial<ReadStagedProductionsPayload> = {}): ReadStagedProductionsPayload =>
    new ReadStagedProductionsPayload(
      overrides.ownerId ?? 'company-1',
      overrides.stagingScope ?? StagingScope.OWNER,
      overrides.type ?? CsvContentType.HYDROGEN_PRODUCTION,
      overrides.from ?? new Date('2026-01-01T00:00:00Z'),
      overrides.to ?? new Date('2026-01-31T23:59:59Z'),
    ),
} as const;
