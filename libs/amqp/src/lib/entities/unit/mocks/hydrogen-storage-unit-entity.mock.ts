import { HydrogenColorDbEnum } from 'libs/database/src/lib';
import { HydrogenStorageUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { AddressEntityPowerMock } from '../../address';
import { HydrogenStorageUnitEntity } from '../hydrogen-storage-unit.entity';
import { HydrogenComponentEntity } from '../../bottling';

export const HydrogenStorageUnitEntityMock: HydrogenStorageUnitEntity[] = [
  new HydrogenStorageUnitEntity(
    HydrogenStorageUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer,
    UnitSeed[0].modelType,
    UnitSeed[0].serialNumber,
    new Date(UnitSeed[0].commissionedOn),
    new Date(UnitSeed[0].decommissioningPlannedOn),
    AddressEntityPowerMock,
    null,
    HydrogenStorageUnitSeed[0].capacity.toNumber(),
    [new HydrogenComponentEntity(HydrogenColorDbEnum.GREEN, 100)],
    [],
  ),
];
