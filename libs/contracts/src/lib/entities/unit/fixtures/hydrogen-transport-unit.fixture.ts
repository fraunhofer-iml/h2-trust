/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelType, TransportType, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from '../../address/fixtures/address.fixture';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';
import { UnitEntity } from '../unit.entity';

export const HydrogenTransportUnitEntityFixture = {
  create: (overrides: Partial<UnitEntity> = {}): UnitEntity =>
    ({
      id: overrides.id ?? 'hydrogen-transport-unit-1',
      name: overrides.name ?? 'Hydrogen Transport Unit',
      manufacturer: overrides.manufacturer ?? 'Hydrogen Manufacturer',
      modelType: overrides.modelType ?? 'MT-HYDROGEN-003',
      modelNumber: overrides.modelNumber ?? 'MN-HYDROGEN-003',
      serialNumber: overrides.serialNumber ?? 'SN-HYDROGEN-003',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      owner: overrides.owner ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.TRANSPORTATION,
      capacity: overrides.specification?.capacity ?? 1000,
      active: true,
      specification: overrides.specification ?? {
        id: 'specification-1',
        type: overrides.specification?.type ?? TransportType.PIPELINE,
        fuelType: FuelType.DIESEL,
      },
    }) as UnitEntity,
} as const;
