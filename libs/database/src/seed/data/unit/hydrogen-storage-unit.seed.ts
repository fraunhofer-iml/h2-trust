/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnit, Prisma } from '@prisma/client';
import { HydrogenStorageType } from '@h2-trust/domain';
import { UnitSeed } from './unit.seed';

export const HydrogenStorageUnitSeed = <HydrogenStorageUnit[]>[
  {
    id: UnitSeed[5].id,
    type: HydrogenStorageType.COMPRESSED_GASEOUS_HYDROGEN,
    capacity: new Prisma.Decimal(1200),
    pressure: new Prisma.Decimal(350),
  },
];
