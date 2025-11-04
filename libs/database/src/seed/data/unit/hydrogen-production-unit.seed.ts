/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnit, Prisma } from '@prisma/client';
import { BiddingZone, HydrogenProductionMethod, HydrogenProductionTechnology } from '@h2-trust/domain';
import { UnitSeed } from './unit.seed';

export const HydrogenProductionUnitSeed = <HydrogenProductionUnit[]>[
  {
    id: UnitSeed[4].id,
    method: HydrogenProductionMethod.ELECTROLYSIS,
    technology: HydrogenProductionTechnology.PEM,
    biddingZone: BiddingZone.DE_LU,
    ratedPower: new Prisma.Decimal(5),
    pressure: new Prisma.Decimal(25),
    waterConsumptionLitersPerHour: new Prisma.Decimal(2),
  },
];
