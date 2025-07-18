import { PowerProductionUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { AddressEntityPowerMock } from '../../address';
import { PowerProductionUnitEntity } from '../power-production-unit.entity';
import { PowerProductionUnitTypeEntityMock } from './power-production-unit-type-entity.mock';

export const PowerProductionUnitEntityMock: PowerProductionUnitEntity[] = [
  new PowerProductionUnitEntity(
    PowerProductionUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer,
    UnitSeed[0].modelType,
    UnitSeed[0].serialNumber,
    new Date(UnitSeed[0].commissionedOn),
    new Date(UnitSeed[0].decommissioningPlannedOn),
    AddressEntityPowerMock,
    null,
    PowerProductionUnitSeed[0].ratedPower.toNumber(),
    PowerProductionUnitSeed[0].gridOperator,
    PowerProductionUnitSeed[0].gridLevel,
    PowerProductionUnitSeed[0].gridConnectionNumber,
    PowerProductionUnitTypeEntityMock[1],
  ),
];
