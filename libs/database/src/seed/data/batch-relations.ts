import { ProducedHydrogenBatches } from './batches/batches-produced-hydrogen';
import { ProducedPowerBatches } from './batches/batches-produced-power';

export const BatchRelations = ProducedHydrogenBatches.map((hydrogenBatch, index) => ({
  A: hydrogenBatch.id,
  B: ProducedPowerBatches[index].id,
}));
