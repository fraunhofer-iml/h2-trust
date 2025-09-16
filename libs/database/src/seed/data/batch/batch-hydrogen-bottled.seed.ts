/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompanySeed } from '../company.seed';

export const BatchHydrogenBottledSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-bottled-1',
    active: true,
    amount: new Prisma.Decimal(10),
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
  },
  {
    id: 'batch-hydrogen-bottled-2',
    active: true,
    amount: new Prisma.Decimal(50),
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
  },
  {
    id: 'batch-hydrogen-bottled-3',
    active: true,
    amount: new Prisma.Decimal(50),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
  },
];
