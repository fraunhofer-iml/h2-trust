import { CompaniesSeed, HydrogenBatchesProducedSeed } from '@h2-trust/database';
import { BatchEntity } from '../batch.entity';

export const BatchEntitiesMock: BatchEntity[] = HydrogenBatchesProducedSeed.map((batch) => ({
  ...batch,
  amount: batch.amount.toNumber(),
  owner: CompaniesSeed[1],
}));
