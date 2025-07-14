import { Batch, BatchType, Prisma } from '@prisma/client';
import { CompaniesSeed } from '../companies.seed';
import { getElementOrThrowError } from '../utils';

export const PowerBatchesProducedSeed = <Batch[]>[
  {
    id: 'batch-produced-power-1',
    active: false,
    amount: new Prisma.Decimal(20),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-2',
    active: false,
    amount: new Prisma.Decimal(40),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-3',
    active: false,
    amount: new Prisma.Decimal(60),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-4',
    active: false,
    amount: new Prisma.Decimal(100),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-5',
    active: false,
    amount: new Prisma.Decimal(200),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
];
