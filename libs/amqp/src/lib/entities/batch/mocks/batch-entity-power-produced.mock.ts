import { BatchPowerProducedSeed } from 'libs/database/src/seed';
import { CompanyEntityPowerMock } from '../../company/mocks';
import { BatchEntity } from '../batch.entity';

export const BatchEntityPowerProducedMock: BatchEntity[] = BatchPowerProducedSeed.map(
  (seed) =>
    new BatchEntity(
      seed.id,
      seed.active,
      seed.amount.toNumber(),
      seed.quality,
      seed.type,
      [],
      [],
      CompanyEntityPowerMock,
      null,
    ),
);
