/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitEntity } from '@h2-trust/contracts';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from '../../address/fixtures/address.fixture';
import { HydrogenComponentEntityFixture } from '../../bottling/fixtures/hydrogen-component.fixture';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';

export const HydrogenStorageUnitEntityFixture = {
  create: (overrides: Partial<HydrogenStorageUnitEntity> = {}): HydrogenStorageUnitEntity =>
    ({
      id: overrides.id ?? 'hydrogen-storage-unit-1',
      name: overrides.name ?? 'Hydrogen Storage Unit',
      mastrNumber: overrides.mastrNumber ?? 'MASTR-HYDROGEN-003',
      manufacturer: overrides.manufacturer ?? 'Hydrogen Manufacturer',
      modelType: overrides.modelType ?? 'MT-HYDROGEN-003',
      modelNumber: overrides.modelNumber ?? 'MN-HYDROGEN-003',
      serialNumber: overrides.serialNumber ?? 'SN-HYDROGEN-003',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      owner: overrides.owner ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.HYDROGEN_STORAGE,
      capacity: overrides.capacity ?? 1000,
      pressure: overrides.pressure ?? 2,
      type: overrides.type ?? HydrogenStorageType.LIQUID_HYDROGEN,
      filling: overrides.filling ?? [HydrogenComponentEntityFixture.createGreen()],
    }) as HydrogenStorageUnitEntity,
} as const;
