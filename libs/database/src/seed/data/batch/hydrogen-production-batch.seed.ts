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
import { HydrogenStorageUnitSeed } from '../unit/hydrogen-storage-unit.seed';

export const HydrogenProductionBatchSeed: readonly Batch[] = Object.freeze([
  {
    id: 'batch-hydrogen-produced-0',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-1',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-2',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-3',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-4',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-5',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-6',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-7',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-8',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-9',
    createdAt: auditTimestamp,
    updatedAt: auditTimestamp,
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
]);
