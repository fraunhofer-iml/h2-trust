import {
  HydrogenProductionTypeSeed,
  HydrogenProductionUnitSeed,
  HydrogenStorageUnitSeed,
  UnitSeed,
} from 'libs/database/src/seed';
import { AddressEntityPowerMock } from '../../address';
import { HydrogenProductionUnitEntity } from '../hydrogen-production-unit.entity';

export const HydrogenProductionUnitEntityMock: HydrogenProductionUnitEntity[] = [
  new HydrogenProductionUnitEntity(
    HydrogenProductionUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer,
    UnitSeed[0].modelType,
    UnitSeed[0].serialNumber,
    new Date(UnitSeed[0].commissionedOn),
    AddressEntityPowerMock,
    null,
    HydrogenProductionUnitSeed[0].ratedPower.toNumber(),
    HydrogenProductionUnitSeed[0].pressure.toNumber(),
    HydrogenProductionTypeSeed[0],
    HydrogenProductionUnitSeed[0].biddingZoneName,
    {
      id: HydrogenStorageUnitSeed[0].id,
      name: UnitSeed[5].name,
    },
  ),
];
