/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { DownloadFilesDto } from '@h2-trust/contracts/dtos';

export const DownloadFilesDtoFixture = {
  create: (overrides: Partial<DownloadFilesDto> = {}): DownloadFilesDto => ({
    ids: overrides.ids ?? ['document-1'],
  }),
} as const;