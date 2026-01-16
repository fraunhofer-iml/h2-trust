/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitEntity } from '@h2-trust/amqp';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from './address.entity.fixture';
import { CompanyEntityFixture } from './company.entity.fixture';

export const HydrogenProductionUnitEntityFixture = {
  create: (overrides: Partial<HydrogenProductionUnitEntity> = {}): HydrogenProductionUnitEntity =>
    ({
      id: overrides.id ?? 'hydrogen-production-unit-1',
      name: overrides.name ?? 'Hydrogen Production Unit',
      mastrNumber: overrides.mastrNumber ?? 'MASTR-HYDROGEN-002',
      manufacturer: overrides.manufacturer ?? 'Hydrogen Manufacturer',
      modelType: overrides.modelType ?? 'MT-HYDROGEN-002',
      modelNumber: overrides.modelNumber ?? 'MN-HYDROGEN-002',
      serialNumber: overrides.serialNumber ?? 'SN-HYDROGEN-002',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      company: overrides.company ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.HYDROGEN_PRODUCTION,
      ratedPower: overrides.ratedPower ?? 500,
      pressure: overrides.pressure ?? 30,
      method: overrides.method ?? HydrogenProductionMethod.ELECTROLYSIS,
      technology: overrides.technology ?? HydrogenProductionTechnology.PEM,
      biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
      waterConsumptionLitersPerHour: overrides.waterConsumptionLitersPerHour ?? 10,
    }) as HydrogenProductionUnitEntity,
} as const;
