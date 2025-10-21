/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch, Prisma } from '@prisma/client';
import { BatchType, HydrogenColor } from '@h2-trust/domain';
import { CompanySeed } from '../company.seed';

export const BatchHydrogenTransportedSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-transported-1',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(10),
    active: true,
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    ownerId: CompanySeed[3].id,
  },
  {
    id: 'batch-hydrogen-transported-2',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    ownerId: CompanySeed[3].id,
  },
];
