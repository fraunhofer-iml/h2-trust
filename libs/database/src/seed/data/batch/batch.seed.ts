import { Batch } from '@prisma/client';
import { BatchHydrogenBottledSeed } from './batch-hydrogen-bottled.seed';
import { BatchHydrogenProducedSeed } from './batch-hydrogen-produced.seed';
import { BatchPowerProducedSeed } from './batch-power-produced.seed';

export const BatchSeed = <Batch[]>[
  ...BatchPowerProducedSeed,
  ...BatchHydrogenBottledSeed,
  ...BatchHydrogenProducedSeed,
];
