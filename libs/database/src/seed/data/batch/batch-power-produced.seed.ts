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

export const BatchPowerProducedSeed = <Batch[]>[
  {
    id: 'batch-power-produced-1',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(20),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-2',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(40),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-3',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(60),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-4',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(100),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-5',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(200),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-6',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(100),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-7',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-8',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(25),
    active: false,
    quality: `TBD`,
    ownerId: CompanySeed[0].id,
  },
];
