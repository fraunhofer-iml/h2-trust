import { Batch, BatchType, Prisma } from '@prisma/client';
import { CompaniesSeed } from '../companies.seed';
import { getElementOrThrowError } from '../utils';

export const PowerBatchesProducedSeed = <Batch[]>[
  {
    id: 'batch-produced-power-1',
    active: true,
    amount: new Prisma.Decimal(2.22),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-2',
    active: true,
    amount: new Prisma.Decimal(0.5),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-3',
    active: true,
    amount: new Prisma.Decimal(0.1),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
  {
    id: 'batch-produced-power-4',
    active: true,
    amount: new Prisma.Decimal(0.1),
    quality: `TBD`,
    type: BatchType.POWER,
    ownerId: getElementOrThrowError(CompaniesSeed, 0, 'Company').id,
  },
];
