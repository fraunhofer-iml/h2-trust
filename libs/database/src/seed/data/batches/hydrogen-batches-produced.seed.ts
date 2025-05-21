import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';
import { CompaniesSeed } from '../companies.seed';
import { HydrogenStorageUnitsSeed } from '../units/hydrogen-storage-units.seed';

export const HydrogenBatchesProducedSeed = <Batch[]>[
  {
    id: 'batch-produced-hydrogen-1',
    active: true,
    amount: new Prisma.Decimal(111.0),
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompaniesSeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'batch-produced-hydrogen-2',
    active: true,
    amount: new Prisma.Decimal(10.0),
    quality: `{"color": "${HydrogenColor.YELLOW}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompaniesSeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'batch-produced-hydrogen-3',
    active: true,
    amount: new Prisma.Decimal(5.0),
    quality: `{"color": "${HydrogenColor.ORANGE}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompaniesSeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitsSeed[0].id,
  },
  {
    id: 'batch-produced-hydrogen-4',
    active: true,
    amount: new Prisma.Decimal(5.0),
    quality: `{"color": "${HydrogenColor.PINK}"}`,
    type: BatchType.HYDROGEN,
    ownerId: CompaniesSeed[1].id,
    hydrogenStorageUnitId: HydrogenStorageUnitsSeed[0].id,
  },
];
