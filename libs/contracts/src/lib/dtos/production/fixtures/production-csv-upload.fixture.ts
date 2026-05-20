/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProductionCSVUploadDto } from '@h2-trust/contracts/dtos';
import { CsvContentType } from '@h2-trust/domain';

export const ProductionCsvUploadDtoFixture = {
  create: (overrides: Partial<ProductionCSVUploadDto> = {}): ProductionCSVUploadDto => ({
    unitIds: overrides.unitIds ?? ['unit-1'],
    csvContentType: overrides.csvContentType ?? CsvContentType.HYDROGEN,
    timeZone: overrides.timeZone ?? 'Europe/Berlin',
  }),
} as const;