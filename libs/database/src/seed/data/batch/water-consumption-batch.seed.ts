/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch, Prisma } from '@prisma/client';
import { BatchType } from '@h2-trust/domain';
import { auditTimestamp } from '../audit-timestamp.constant';
import { CompanySeed } from '../company.seed';

export const WaterConsumptionBatchSeed = <Batch[]>[
  {
    id: 'batch-water-consumed-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(500),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(500),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-3',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-4',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-5',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-6',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-7',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-8',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
  },
  {
    id: 'batch-water-consumed-9',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.WATER,
    amount: new Prisma.Decimal(500),
    active: false,
    ownerId: CompanySeed[2].id,
  },
];
