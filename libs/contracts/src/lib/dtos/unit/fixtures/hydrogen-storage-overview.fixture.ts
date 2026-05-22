/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageOverviewDto } from '@h2-trust/contracts/dtos';
import { HydrogenStorageType, RfnboType, UnitType } from '@h2-trust/domain';

export const HydrogenStorageOverviewDtoFixture = {
  create: (overrides: Partial<HydrogenStorageOverviewDto> = {}): HydrogenStorageOverviewDto => ({
    id: overrides.id ?? 'hydrogen-storage-unit-1',
    name: overrides.name ?? 'Hydrogen Storage 1',
    capacity: overrides.capacity ?? 100,
    filling: overrides.filling ?? 40,
    unitType: UnitType.HYDROGEN_STORAGE,
    storageType: overrides.storageType ?? HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN,
    hydrogenComposition: overrides.hydrogenComposition ?? [
      { processId: null, amount: 40, rfnboType: RfnboType.RFNBO_READY },
    ],
    active: overrides.active ?? true,
  }),
} as const;
