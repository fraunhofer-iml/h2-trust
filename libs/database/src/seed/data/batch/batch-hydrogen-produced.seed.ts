/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompanySeed } from '../company.seed';
import { HydrogenStorageUnitSeed } from '../unit';

export const BatchHydrogenProducedSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-produced-1',
    active: false,
    amount: new Prisma.Decimal(10.0),
    quality: `{"color":"${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-2',
    active: false,
    amount: new Prisma.Decimal(20.0),
    quality: `{"color":"${HydrogenColor.PINK}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-3',
    active: false,
    amount: new Prisma.Decimal(30.0),
    quality: `{"color":"${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-4',
    active: false,
    amount: new Prisma.Decimal(50.0),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-5',
    active: true,
    amount: new Prisma.Decimal(100.0),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-6',
    active: true,
    amount: new Prisma.Decimal(50.0),
    quality: `{"color":"${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-7',
    active: true,
    amount: new Prisma.Decimal(25.0),
    quality: `{"color":"${HydrogenColor.PINK}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-8',
    active: true,
    amount: new Prisma.Decimal(12.5),
    quality: `{"color":"${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
];
