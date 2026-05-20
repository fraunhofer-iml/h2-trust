/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileInfoDto } from '@h2-trust/contracts/dtos';

export const FileInfoDtoFixture = {
  create: (overrides: Partial<FileInfoDto> = {}): FileInfoDto => ({
    description: overrides.description ?? 'Fixture document',
    url: overrides.url ?? 'https://example.com/files/fixture.pdf',
  }),
} as const;
