import { BatchHydrogenProducedSeed } from 'libs/database/src/seed';
import { CompanyEntityHydrogenMock } from '../../company/mocks';
import { BatchEntity } from '../batch.entity';

export const BatchEntityHydrogenProducedMock: BatchEntity[] = BatchHydrogenProducedSeed.map(
  (seed) =>
    new BatchEntity(
      seed.id,
      seed.active,
      seed.amount.toNumber(),
      seed.quality,
      seed.type,
      [],
      [],
      CompanyEntityHydrogenMock,
      undefined,
    ),
);
