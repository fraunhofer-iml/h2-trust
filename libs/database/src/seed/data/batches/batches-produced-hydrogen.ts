import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';

export const ProducedHydrogenBatches = <Batch[]>[
  {
    id: 'batch-produced-hydrogen-1',
    active: true,
    amount: new Prisma.Decimal(111.0),
    quality: `{"color": "${HydrogenColor.GREEN}}"`,
    type: BatchType.HYDROGEN,
    ownerId: 'company-hydrogen-1',
    hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
  },
  {
    id: 'batch-produced-hydrogen-2',
    active: true,
    amount: new Prisma.Decimal(10.0),
    quality: `{"color": "${HydrogenColor.GREEN}}"`,
    type: BatchType.HYDROGEN,
    ownerId: 'company-hydrogen-1',
    hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
  },
  {
    id: 'batch-produced-hydrogen-3',
    active: true,
    amount: new Prisma.Decimal(5.0),
    quality: `{"color": "${HydrogenColor.GREEN}}"`,
    type: BatchType.HYDROGEN,
    ownerId: 'company-hydrogen-1',
    hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
  },
  {
    id: 'batch-produced-hydrogen-4',
    active: true,
    amount: new Prisma.Decimal(5.0),
    quality: `{"color": "${HydrogenColor.GREEN}}"`,
    type: BatchType.HYDROGEN,
    ownerId: 'company-hydrogen-1',
    hydrogenStorageUnitId: 'hydrogen-storage-unit-1',
  },
];
