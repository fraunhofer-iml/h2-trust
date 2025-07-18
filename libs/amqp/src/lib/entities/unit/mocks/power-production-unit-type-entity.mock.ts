import { PowerProductionUnitTypeSeed } from 'libs/database/src/seed';
import { PowerProductionUnitTypeEntity } from '../power-production-unit-type.entity';

export const PowerProductionUnitTypeEntityMock: PowerProductionUnitTypeEntity[] = PowerProductionUnitTypeSeed.map(
  (seed) => new PowerProductionUnitTypeEntity(seed.name, seed.energySource, seed.hydrogenColor),
);
