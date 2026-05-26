/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitFileImport } from '@h2-trust/contracts/entities';
import { StageProductionsPayload } from '@h2-trust/contracts/payloads';
import { CsvContentType } from '@h2-trust/domain';

const createUnitFileImport = (overrides: Partial<UnitFileImport> = {}): UnitFileImport =>
  new UnitFileImport(
    overrides.unitId ?? 'power-production-unit-1',
    overrides.hashedFileBuffer ?? 'hashed-file-buffer-1',
    overrides.encodedFileBuffer ?? 'encoded-file-buffer-1',
    overrides.productionType ?? CsvContentType.POWER_PRODUCTION,
  );

export const StageProductionsPayloadFixture = {
  create: (overrides: Partial<StageProductionsPayload> = {}): StageProductionsPayload =>
    new StageProductionsPayload(
      overrides.productionImports ?? [createUnitFileImport()],
      overrides.userId ?? 'user-1',
      overrides.companyId ?? 'company-1',
      overrides.timeZone ?? 'Europe/Berlin',
    ),
} as const;
