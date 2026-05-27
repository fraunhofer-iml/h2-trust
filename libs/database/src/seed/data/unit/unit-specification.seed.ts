/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma, UnitSpecification } from '@prisma/client';
import {
  BiddingZone,
  FuelType,
  HydrogenProductionMethod,
  HydrogenProductionTechnology,
  HydrogenStorageType,
  PowerProductionType,
  TransportMode,
} from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';

export const UnitSpecificationSeed: readonly Partial<UnitSpecification>[] = Object.freeze([
  {
    id: 'power-production-unit-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.PHOTOVOLTAIC_SYSTEM,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(4.5),
    decommissioningPlannedOn: new Date('2045-04-01'),
    financialSupportReceived: false,
  },
  {
    id: 'power-production-unit-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.WIND_TURBINE,
    biddingZone: BiddingZone.FR,
    ratedPower: new Prisma.Decimal(1500),
    decommissioningPlannedOn: new Date('2043-06-15'),
    financialSupportReceived: true,
  },
  {
    id: 'power-production-unit-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.WIND_TURBINE,
    biddingZone: BiddingZone.FR,
    ratedPower: new Prisma.Decimal(1500),
    decommissioningPlannedOn: new Date('2043-06-15'),
    financialSupportReceived: true,
  },
  {
    id: 'power-production-unit-3',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.GRID,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(100000),
    decommissioningPlannedOn: new Date('2045-08-14'),
    financialSupportReceived: false,
  },
  {
    id: 'hydrogen-production-unit-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    method: HydrogenProductionMethod.ELECTROLYSIS,
    technology: HydrogenProductionTechnology.PEM,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(5),
  },
  {
    id: 'hydrogen-storage-unit-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    storageType: HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN,
    capacity: new Prisma.Decimal(1200),
  },
  {
    id: 'hydrogen-transport-unit-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    transportMode: TransportMode.TRAILER,
    fuelType: FuelType.DIESEL,
  },
]);
