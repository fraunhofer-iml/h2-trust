/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitEntity } from '@h2-trust/amqp';
import { BiddingZone, GridLevel, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from './address.entity.fixture';
import { CompanyEntityFixture } from './company.entity.fixture';
import { PowerProductionTypeEntityFixture } from './power-production-type.entity.fixture';

export const PowerProductionUnitEntityFixture = {
  create: (overrides: Partial<PowerProductionUnitEntity> = {}): PowerProductionUnitEntity =>
    ({
      id: overrides.id ?? 'power-production-unit-1',
      name: overrides.name ?? 'Power Production Unit',
      mastrNumber: overrides.mastrNumber ?? 'MASTR-POWER-001',
      manufacturer: overrides.manufacturer ?? 'Power Manufacturer',
      modelType: overrides.modelType ?? 'MT-POWER-001',
      modelNumber: overrides.modelNumber ?? 'MN-POWER-001',
      serialNumber: overrides.serialNumber ?? 'SN-POWER-001',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      company: overrides.company ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.POWER_PRODUCTION,
      decommissioningPlannedOn: overrides.decommissioningPlannedOn ?? undefined,
      electricityMeterNumber: overrides.electricityMeterNumber ?? 'METER-001',
      ratedPower: overrides.ratedPower ?? 1000,
      gridOperator: overrides.gridOperator ?? 'Grid Operator GmbH',
      gridLevel: overrides.gridLevel ?? GridLevel.LOW_VOLTAGE,
      biddingZone: overrides.biddingZone ?? BiddingZone.DE_LU,
      gridConnectionNumber: overrides.gridConnectionNumber ?? 'GRID-001',
      financialSupportReceived: overrides.financialSupportReceived ?? false,
      type: overrides.type ?? PowerProductionTypeEntityFixture.createSolarEnergy(),
    }) as PowerProductionUnitEntity,
} as const;
