import { Batch, BatchType, Prisma } from '@prisma/client';

export const Batches = <Batch[]>[
  {
    id: 'batch-produced-power-1',
    active: true,
    quantity: new Prisma.Decimal(0.53),
    quality: 'green',
    type: BatchType.POWER,
    ownerId: 'company-power-1',
  },
  {
    id: 'batch-produced-hydrogen-1',
    active: true,
    quantity: new Prisma.Decimal(111.11),
    quality: 'green',
    type: BatchType.HYDROGEN,
    ownerId: 'company-hydrogen-1',
    hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
  },
  {
    id: 'batch-transported-hydrogen-1',
    active: true,
    quantity: new Prisma.Decimal(111.11),
    quality: 'green',
    type: BatchType.HYDROGEN,
    ownerId: 'company-hydrogen-1',
  },
];
