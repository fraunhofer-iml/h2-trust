/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma, UnitSpecifications } from '@prisma/client';
import { BiddingZone, PowerProductionType } from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';
import { UnitSeed } from './unit.seed';

export const PowerProductionUnitSeed: readonly Partial<UnitSpecifications>[] = Object.freeze([
  {
    id: UnitSeed[0].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.PHOTOVOLTAIC_SYSTEM,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(4.5),
    decommissioningPlannedOn: new Date('2045-04-01'),
    financialSupportReceived: false,
    unitId: UnitSeed[0].id,
  },
  {
    id: UnitSeed[1].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.WIND_TURBINE,
    biddingZone: BiddingZone.FR,
    ratedPower: new Prisma.Decimal(1500),
    decommissioningPlannedOn: new Date('2043-06-15'),
    financialSupportReceived: true,
    unitId: UnitSeed[1].id,
  },
  {
    id: UnitSeed[2].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.WIND_TURBINE,
    biddingZone: BiddingZone.FR,
    ratedPower: new Prisma.Decimal(1500),
    decommissioningPlannedOn: new Date('2043-06-15'),
    financialSupportReceived: true,
    unitId: UnitSeed[2].id,
  },
  {
    id: UnitSeed[3].id,
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    powerProductionType: PowerProductionType.GRID,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(100000),
    decommissioningPlannedOn: new Date('2045-08-14'),
    financialSupportReceived: false,
    unitId: UnitSeed[3].id,
  },
]);
