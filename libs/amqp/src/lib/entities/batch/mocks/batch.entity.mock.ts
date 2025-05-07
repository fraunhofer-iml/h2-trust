// eslint-disable-next-line @nx/enforce-module-boundaries
import { Companies, ProducedHydrogenBatches } from '@h2-trust/database';
import { BatchEntity } from '../batch.entity';

export const BatchEntitiesMock: BatchEntity[] = ProducedHydrogenBatches.map((batch) => ({
  ...batch,
  amount: batch.amount.toNumber(),
  owner: Companies[1],
}));
