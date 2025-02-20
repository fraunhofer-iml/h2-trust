import { Batch, BatchType, Prisma } from '@prisma/client';

export const Batches = <Batch[]>[
  {
    id: 'batch-generated-power',
    active: false,
    quantity: new Prisma.Decimal(0.53),
    recipientId: 'company-hydrogen',
    type: BatchType.POWER,
  },
  {
    id: 'batch-generated-hydrogen',
    active: false,
    quantity: new Prisma.Decimal(111.11),
    recipientId: 'company-hydrogen',
    type: BatchType.HYDROGEN,
    hydrogenStorageUnitId: 'hydrogen-storage-unit-production-site',
  },
  {
    id: 'batch-transported-hydrogen',
    active: true,
    quantity: new Prisma.Decimal(111.11),
    recipientId: 'company-hydrogen',
    type: BatchType.HYDROGEN,
  },
];
