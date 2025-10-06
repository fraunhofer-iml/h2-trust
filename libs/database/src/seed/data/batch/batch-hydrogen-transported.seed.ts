/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompanySeed } from '../company.seed';

export const BatchHydrogenTransportedSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-transported-1',
    active: true,
    amount: new Prisma.Decimal(10),
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[3].id,
  },
  {
    id: 'batch-hydrogen-transported-2',
    active: true,
    amount: new Prisma.Decimal(50),
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[3].id,
  },
];
