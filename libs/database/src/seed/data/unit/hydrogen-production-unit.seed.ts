/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnit, Prisma } from '@prisma/client';
import { BiddingZoneSeed } from './bidding-zone.seed';
import { HydrogenProductionTypeSeed } from './hydrogen-production-type.seed';
import { UnitSeed } from './unit.seed';

export const HydrogenProductionUnitSeed = <HydrogenProductionUnit[]>[
  {
    id: UnitSeed[4].id,
    ratedPower: new Prisma.Decimal(1000),
    pressure: new Prisma.Decimal(10),
    typeId: HydrogenProductionTypeSeed[0].id,
    biddingZoneName: BiddingZoneSeed[0].name,
  },
];
