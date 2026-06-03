/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { UnitEntity } from '@h2-trust/contracts/entities';
import { BiddingZone, PowerProductionType, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from '../../address/fixtures/address.fixture';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';

export const PowerProductionUnitEntityFixture = {
  create: (overrides: Partial<UnitEntity> = {}): UnitEntity =>
    ({
      id: overrides.id ?? 'power-production-unit-1',
      name: overrides.name ?? 'Power Production Unit',
      manufacturer: overrides.manufacturer ?? 'Power Manufacturer',
      modelType: overrides.modelType ?? 'MT-POWER-001',
      modelNumber: overrides.modelNumber ?? 'MN-POWER-001',
      serialNumber: overrides.serialNumber ?? 'SN-POWER-001',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      owner: overrides.owner ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.POWER_PRODUCTION,
      decommissioningPlannedOn: overrides.specification?.decommissioningPlannedOn ?? new Date('2025-01-01'),
      ratedPower: overrides.specification?.ratedPower ?? 1000,
      biddingZone: overrides.specification?.biddingZone ?? BiddingZone.DE_LU,
      financialSupportReceived: overrides.specification?.financialSupportReceived ?? false,
      type: overrides.specification?.type ?? PowerProductionType.PHOTOVOLTAIC_SYSTEM,
      active: true,
      specification: overrides.specification ?? {
        id: 'specification-1',
      },
    }) as UnitEntity,
} as const;
