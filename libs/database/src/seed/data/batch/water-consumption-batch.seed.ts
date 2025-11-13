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

export const WaterConsumptionBatchSeed = <Batch[]>[
  {
    id: 'batch-water-consumed-0',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(500),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-1',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(500),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-2',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-3',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-4',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-5',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-6',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-7',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-8',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-9',
    type: BatchType.WATER,
    amount: new Prisma.Decimal(500),
    active: false,
    ownerId: CompanySeed[2].id,
  },
];
