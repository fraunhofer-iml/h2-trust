/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch, Prisma } from '@prisma/client';
import { BatchType } from '@h2-trust/domain';
import { CompanySeed } from '../company.seed';

export const HydrogenBottlingBatchSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-bottled-0',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(15),
    active: false,
    ownerId: CompanySeed[1].id,
  },
  {
    id: 'batch-hydrogen-bottled-1',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[1].id,
  },
  {
    id: 'batch-hydrogen-bottled-2',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[1].id,
  },
];
