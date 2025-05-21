import { Batch } from '@prisma/client';
import { HydrogenBatchesBottledSeed } from './hydrogen-batches-bottled.seed';
import { HydrogenBatchesProducedSeed } from './hydrogen-batches-produced.seed';
import { PowerBatchesProducedSeed } from './power-batches-produced.seed';

export const BatchesSeed = <Batch[]>[
  ...PowerBatchesProducedSeed,
  ...HydrogenBatchesProducedSeed,
  ...HydrogenBatchesBottledSeed,
];
