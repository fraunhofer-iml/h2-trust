import { HydrogenProductionTypeSeed } from 'libs/database/src/seed';
import { HydrogenProductionTypeEntity } from '../hydrogen-production-type.entity';

export const HydrogenProductionTypeEntityMock: HydrogenProductionTypeEntity[] = HydrogenProductionTypeSeed.map(
  (seed) => new HydrogenProductionTypeEntity(seed.id, seed.method, seed.technology),
);
