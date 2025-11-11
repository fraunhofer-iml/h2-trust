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
import { HydrogenStorageUnitSeed } from '../unit/hydrogen-storage-unit.seed';

export const HydrogenProductionBatchSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-produced-0',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-1',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-2',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-3',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-4',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-5',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-6',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-7',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-8',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(5),
    active: false,
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-9',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50),
    active: true,
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    ownerId: CompanySeed[2].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
];
