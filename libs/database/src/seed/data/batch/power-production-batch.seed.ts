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

export const PowerProductionBatchSeed: readonly Batch[] = Object.freeze([
  {
    id: 'batch-power-produced-0',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-1',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-2',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-3',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-4',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-5',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-6',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-7',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-8',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(10),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
  {
    id: 'batch-power-produced-9',
    type: BatchType.POWER,
    amount: new Prisma.Decimal(50),
    active: false,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: null,
  },
]);
