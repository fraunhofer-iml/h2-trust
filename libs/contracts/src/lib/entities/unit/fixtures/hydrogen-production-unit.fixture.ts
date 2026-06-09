/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BiddingZone, HydrogenProductionTechnology, HydrogenProductionType, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from '../../address/fixtures/address.fixture';
import { CompanyEntityFixture } from '../../company/fixtures/company.fixture';
import { UnitEntity } from '../unit.entity';

export const HydrogenProductionUnitEntityFixture = {
  create: (overrides: Partial<UnitEntity> = {}): UnitEntity =>
    ({
      id: overrides.id ?? 'hydrogen-production-unit-1',
      name: overrides.name ?? 'Hydrogen Production Unit',
      manufacturer: overrides.manufacturer ?? 'Hydrogen Manufacturer',
      modelType: overrides.modelType ?? 'MT-HYDROGEN-002',
      modelNumber: overrides.modelNumber ?? 'MN-HYDROGEN-002',
      serialNumber: overrides.serialNumber ?? 'SN-HYDROGEN-002',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      owner: overrides.owner ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.HYDROGEN_PRODUCTION,
      ratedPower: overrides.specification?.ratedPower ?? 500,
      type: overrides.specification?.type ?? HydrogenProductionType.ELECTROLYSIS,
      technology: overrides.specification?.technology ?? HydrogenProductionTechnology.PEM,
      biddingZone: overrides.specification?.biddingZone ?? BiddingZone.DE_LU,
      waterConsumptionLitersPerHour: overrides.specification?.waterConsumptionLitersPerHour ?? 10,
      active: true,
      specification: overrides.specification ?? {
        id: 'specification-1',
      },
    }) as UnitEntity,
} as const;
