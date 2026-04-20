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

export const PowerProductionBatchSeed: readonly Batch[] = Object.freeze([
  {
    id: 'batch-power-produced-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-3',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-4',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-5',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-6',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-7',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-8',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-9',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
]);
