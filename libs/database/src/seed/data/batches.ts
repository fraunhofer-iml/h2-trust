import { Batch } from '@prisma/client';
import { BottledBatches } from './batches/batches-bottled';
import { ProducedHydrogenBatches } from './batches/batches-produced-hydrogen';
import { ProducedPowerBatches } from './batches/batches-produced-power';

export const Batches = <Batch[]>[...ProducedPowerBatches, ...ProducedHydrogenBatches, ...BottledBatches];
