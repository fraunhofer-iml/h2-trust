import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompaniesSeed } from '../companies.seed';
import { HydrogenStorageUnitsSeed } from '../units';
import { getElementOrThrowError } from '../utils';

export const HydrogenBatchesProducedSeed = <Batch[]>[
  {
    id: 'batch-produced-hydrogen-1',
    active: false,
    amount: new Prisma.Decimal(10.0),
    quality: `{"color":"${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-produced-hydrogen-2',
    active: false,
    amount: new Prisma.Decimal(20.0),
    quality: `{"color":"${HydrogenColor.PINK}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-produced-hydrogen-3',
    active: false,
    amount: new Prisma.Decimal(30.0),
    quality: `{"color":"${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-produced-hydrogen-4',
    active: false,
    amount: new Prisma.Decimal(50.0),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
    hydrogenStorageUnitId: undefined,
  },
  {
    id: 'batch-produced-hydrogen-5',
    active: true,
    amount: new Prisma.Decimal(100.0),
    quality: `{"color":"${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: getElementOrThrowError(CompaniesSeed, 1, 'Company').id,
    hydrogenStorageUnitId: getElementOrThrowError(HydrogenStorageUnitsSeed, 0, 'Hydrogen Storage Unit').id,
  },
];
