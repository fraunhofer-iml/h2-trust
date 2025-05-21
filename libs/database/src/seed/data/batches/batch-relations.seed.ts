import { HydrogenBatchesProducedSeed } from './hydrogen-batches-produced.seed';
import { PowerBatchesProducedSeed } from './power-batches-produced.seed';

export const BatchRelationsSeed = HydrogenBatchesProducedSeed.map((hydrogenBatch, index) => ({
  A: hydrogenBatch.id,
  B: PowerBatchesProducedSeed[index].id,
}));
