/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from '../../address/fixtures/address.fixture';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';
import { UnitEntity } from '../unit.entity';

export const HydrogenBottlingUnitEntityFixture = {
  create: (overrides: Partial<UnitEntity> = {}): UnitEntity =>
    ({
      id: overrides.id ?? 'hydrogen-bottling-unit-1',
      name: overrides.name ?? 'Hydrogen Bottling Unit',
      manufacturer: overrides.manufacturer ?? 'Hydrogen Manufacturer',
      modelType: overrides.modelType ?? 'MT-HYDROGEN-003',
      modelNumber: overrides.modelNumber ?? 'MN-HYDROGEN-003',
      serialNumber: overrides.serialNumber ?? 'SN-HYDROGEN-003',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      owner: overrides.owner ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.BOTTLING,
      capacity: overrides.specification?.capacity ?? 1000,
      active: true,
      specification: overrides.specification ?? {
        id: 'specification-1',
      },
    }) as UnitEntity,
} as const;
