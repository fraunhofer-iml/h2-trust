/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitInputDto } from '@h2-trust/contracts/dtos';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { UnitInputDtoFixture } from './unit-input.fixture';

export const HydrogenStorageUnitInputDtoFixture = {
  create: (overrides: Partial<HydrogenStorageUnitInputDto> = {}): HydrogenStorageUnitInputDto => ({
    ...UnitInputDtoFixture.create({
      ...overrides,
      unitType: overrides.unitType ?? UnitType.HYDROGEN_STORAGE,
    }),
    storageType: overrides.storageType ?? HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN,
    capacity: overrides.capacity ?? 100,
    pressure: overrides.pressure ?? 30,
  }),
} as const;