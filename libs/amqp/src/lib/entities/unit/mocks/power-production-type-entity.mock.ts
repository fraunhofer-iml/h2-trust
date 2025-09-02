import { PowerProductionTypeSeed } from 'libs/database/src/seed';
import { PowerProductionTypeEntity } from '../power-production-type.entity';

export const PowerProductionTypeEntityMock: PowerProductionTypeEntity[] = PowerProductionTypeSeed.map(
  (seed) => new PowerProductionTypeEntity(seed.name, seed.energySource, seed.hydrogenColor),
);
