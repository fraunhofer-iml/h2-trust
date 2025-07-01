import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompaniesSeed } from '../companies.seed';
import { getElementOrThrowError } from '../utils';

export const HydrogenBatchesBottledSeed = <Batch[]>[
  {
    id: 'batch-bottled-hydrogen-1',
    active: true,
    amount: new Prisma.Decimal(5),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-2',
    active: true,
    amount: new Prisma.Decimal(4),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-3',
    active: true,
    amount: new Prisma.Decimal(3),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-4',
    active: true,
    amount: new Prisma.Decimal(5),
    quality: `{"color":"${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-5',
    active: true,
    amount: new Prisma.Decimal(4),
    quality: `{"color":"${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-6',
    active: true,
    amount: new Prisma.Decimal(3),
    quality: `{"color":"${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-7',
    active: true,
    amount: new Prisma.Decimal(5),
    quality: `{"color":"${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-8',
    active: true,
    amount: new Prisma.Decimal(4),
    quality: `{"color":"${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
  {
    id: 'batch-bottled-hydrogen-9',
    active: true,
    amount: new Prisma.Decimal(3),
    quality: `{"color":"${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
  },
];
