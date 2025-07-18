import { Batch, BatchType, Prisma } from '@prisma/client';
import { CompanySeed } from '../company.seed';

export const BatchPowerProducedSeed = <Batch[]>[
  {
    id: 'batch-power-produced-1',
    active: false,
    amount: new Prisma.Decimal(20),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-2',
    active: false,
    amount: new Prisma.Decimal(40),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-3',
    active: false,
    amount: new Prisma.Decimal(60),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-4',
    active: false,
    amount: new Prisma.Decimal(100),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-5',
    active: false,
    amount: new Prisma.Decimal(200),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-6',
    active: false,
    amount: new Prisma.Decimal(100),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-7',
    active: false,
    amount: new Prisma.Decimal(50),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
  {
    id: 'batch-power-produced-8',
    active: false,
    amount: new Prisma.Decimal(25),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: CompanySeed[0].id,
  },
];
