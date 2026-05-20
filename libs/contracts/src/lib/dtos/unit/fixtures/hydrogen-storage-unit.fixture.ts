/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitDto } from '@h2-trust/contracts/dtos';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { BaseUnitDtoFixture } from './base-unit.fixture';
import { FillingDtoFixture } from './filling.fixture';

export const HydrogenStorageUnitDtoFixture = {
  create: (overrides: Partial<HydrogenStorageUnitDto> = {}): HydrogenStorageUnitDto => ({
    ...BaseUnitDtoFixture.create({
      id: overrides.id,
      name: overrides.name,
      mastrNumber: overrides.mastrNumber,
      manufacturer: overrides.manufacturer,
      modelType: overrides.modelType,
      modelNumber: overrides.modelNumber,
      serialNumber: overrides.serialNumber,
      certifiedBy: overrides.certifiedBy,
      commissionedOn: overrides.commissionedOn,
      address: overrides.address,
      owner: overrides.owner,
      operator: overrides.operator,
      unitType: overrides.unitType ?? UnitType.HYDROGEN_STORAGE,
      active: overrides.active,
    }),
    storageType: overrides.storageType ?? HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN,
    capacity: overrides.capacity ?? 100,
    pressure: overrides.pressure ?? 30,
    filling: overrides.filling ?? [FillingDtoFixture.create()],
  }),
} as const;