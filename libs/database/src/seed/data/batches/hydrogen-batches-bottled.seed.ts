import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompaniesSeed } from '../companies.seed';
import { getElementOrThrowError } from '../utils';

export const HydrogenBatchesBottledSeed = <Batch[]>[
  {
    id: 'batch-bottled-hydrogen-1',
    active: true,
    amount: new Prisma.Decimal(10),
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-2',
    active: true,
    amount: new Prisma.Decimal(50),
    quality: `{"color":"${HydrogenColor.MIX}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-3',
    active: true,
    amount: new Prisma.Decimal(50),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
];
