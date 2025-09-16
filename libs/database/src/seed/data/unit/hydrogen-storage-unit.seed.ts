/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnit, Prisma } from '@prisma/client';
import { HydrogenStorageTypeSeed } from './hydrogen-storage-type.seed';
import { UnitSeed } from './unit.seed';

export const HydrogenStorageUnitSeed = <HydrogenStorageUnit[]>[
  {
    id: UnitSeed[5].id,
    capacity: new Prisma.Decimal(800),
    pressure: new Prisma.Decimal(5),
    typeName: HydrogenStorageTypeSeed[0].name,
  },
];
