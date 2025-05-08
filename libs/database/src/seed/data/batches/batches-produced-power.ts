import { Batch, BatchType, HydrogenColor, Prisma } from '@prisma/client';

export const ProducedPowerBatches = <Batch[]>[
  {
    id: 'batch-produced-power-1',
    active: true,
    amount: new Prisma.Decimal(0.53),
    quality: `{"color": "${HydrogenColor.GREEN}"}`,
    type: BatchType.POWER,
    ownerId: 'company-power-1',
  },
];
