/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClassificationDto } from '@h2-trust/contracts/dtos';
import { BatchType } from '@h2-trust/domain';
import { HydrogenBatchDtoFixture } from './hydrogen-batch.fixture';

export const ClassificationDtoFixture = {
  createLeaf: (overrides: Partial<ClassificationDto> = {}): ClassificationDto => ({
    name: overrides.name ?? 'Green hydrogen',
    emissionOfProcessStep: overrides.emissionOfProcessStep ?? 10,
    amount: overrides.amount ?? 10,
    batches: overrides.batches ?? [HydrogenBatchDtoFixture.create()],
    classifications: overrides.classifications ?? [],
    unit: overrides.unit ?? 'kg H2',
    classificationType: overrides.classificationType ?? BatchType.HYDROGEN,
  }),
  createNested: (overrides: Partial<ClassificationDto> = {}): ClassificationDto => ({
    ...ClassificationDtoFixture.createLeaf(overrides),
    classifications: overrides.classifications ?? [
      ClassificationDtoFixture.createLeaf({ name: 'Nested classification' }),
    ],
  }),
  create: (overrides: Partial<ClassificationDto> = {}): ClassificationDto =>
    ClassificationDtoFixture.createLeaf(overrides),
} as const;
