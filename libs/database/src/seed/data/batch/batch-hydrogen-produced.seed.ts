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
import { HydrogenStorageUnitSeed } from '../unit';

export const BatchHydrogenProducedSeed = <Batch[]>[
  {
    id: 'batch-hydrogen-produced-1',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(10.0),
    active: false,
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-2',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(20.0),
    active: false,
    quality: `{"color": "${HydrogenColor.PINK}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-3',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(30.0),
    active: false,
    quality: `{"color": "${HydrogenColor.ORANGE}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-4',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50.0),
    active: false,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-hydrogen-produced-5',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(100.0),
    active: true,
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-6',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(50.0),
    active: true,
    quality: `{"color": "${HydrogenColor.ORANGE}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-7',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(25.0),
    active: true,
    quality: `{"color": "${HydrogenColor.PINK}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
  {
    id: 'batch-hydrogen-produced-8',
    type: BatchType.HYDROGEN,
    amount: new Prisma.Decimal(12.5),
    active: true,
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    ownerId: CompanySeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitSeed[0].id,
  },
];
