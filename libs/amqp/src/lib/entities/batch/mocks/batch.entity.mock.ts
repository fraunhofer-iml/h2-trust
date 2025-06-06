import { CompaniesSeed, HydrogenBatchesProducedSeed } from 'libs/database/src/seed';
import { BatchEntity } from '../batch.entity';

export const BatchEntitiesMock: BatchEntity[] = HydrogenBatchesProducedSeed.map((batch) => ({
  ...batch,
  amount: batch.amount.toNumber(),
  owner: CompaniesSeed[1],
}));
