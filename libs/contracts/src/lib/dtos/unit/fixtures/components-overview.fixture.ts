/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentsOverviewDto } from '@h2-trust/contracts/dtos';
import { UnitType } from '@h2-trust/domain';
import { HydrogenComponentDtoFixture } from '../../fixtures';

export const ComponentsOverviewDtoFixture = {
  create: (overrides: Partial<ComponentsOverviewDto> = {}): ComponentsOverviewDto => ({
    id: overrides.id ?? 'power-production-unit-1',
    name: overrides.name ?? 'Windpark Nord',
    unitType: overrides.unitType ?? UnitType.BOTTLING,
    capacity: overrides.capacity ?? 100,
    hydrogenComposition: overrides.hydrogenComposition ?? [HydrogenComponentDtoFixture.create()],
    filling: overrides.filling ?? 100,
    active: overrides.active ?? true,
    unitDetailsType: overrides.unitDetailsType ?? undefined,
  }),
} as const;
