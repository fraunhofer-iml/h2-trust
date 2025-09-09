import { HydrogenColorDbEnum } from 'libs/database/src/lib';
import { HydrogenStorageUnitSeed, UnitSeed } from 'libs/database/src/seed';
import { AddressEntityPowerMock } from '../../address';
import { HydrogenComponentEntity } from '../../bottling';
import { HydrogenStorageUnitEntity } from '../hydrogen-storage-unit.entity';

export const HydrogenStorageUnitEntityMock: HydrogenStorageUnitEntity[] = [
  new HydrogenStorageUnitEntity(
    HydrogenStorageUnitSeed[0].id,
    UnitSeed[0].name,
    UnitSeed[0].mastrNumber,
    UnitSeed[0].manufacturer,
    UnitSeed[0].modelType,
    UnitSeed[0].serialNumber,
    new Date(UnitSeed[0].commissionedOn),
    AddressEntityPowerMock,
    null,
    HydrogenStorageUnitSeed[0].capacity.toNumber(),
    HydrogenStorageUnitSeed[0].pressure.toNumber(),
    HydrogenStorageUnitSeed[0].typeName,
    [new HydrogenComponentEntity(HydrogenColorDbEnum.GREEN, 100)],
    [],
  ),
];
