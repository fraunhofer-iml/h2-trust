/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectionDto } from '@h2-trust/contracts/dtos';
import { ClassificationDtoFixture } from './classification.fixture';
import { HydrogenBatchDtoFixture } from './hydrogen-batch.fixture';

export const SectionDtoFixture = {
  create: (overrides: Partial<SectionDto> = {}): SectionDto => ({
    name: overrides.name ?? 'Input media',
    batches: overrides.batches ?? [HydrogenBatchDtoFixture.create()],
    classifications: overrides.classifications ?? [ClassificationDtoFixture.createLeaf()],
  }),
} as const;
