import { HydrogenStorageUnitEntity } from '@h2-trust/amqp';
import { HydrogenStorageType, UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from './address.entity.fixture';
import { CompanyEntityFixture } from './company.entity.fixture';
import { HydrogenComponentEntityFixture } from './hydrogen-component.entity.fixture';

export const HydrogenStorageUnitEntityFixture = {
  create: (overrides: Partial<HydrogenStorageUnitEntity> = {}): HydrogenStorageUnitEntity =>
    ({
      id: overrides.id ?? 'hydrogen-storage-unit-1',
      name: overrides.name ?? 'Hydrogen Storage Unit',
      mastrNumber: overrides.mastrNumber ?? 'MASTR-HYDROGEN-003',
      manufacturer: overrides.manufacturer ?? 'Hydrogen Manufacturer',
      modelType: overrides.modelType ?? 'MT-HYDROGEN-003',
      modelNumber: overrides.modelNumber ?? 'MN-HYDROGEN-003',
      serialNumber: overrides.serialNumber ?? 'SN-HYDROGEN-003',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      company: overrides.company ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.createHydrogenProducer(),
      unitType: overrides.unitType ?? UnitType.HYDROGEN_STORAGE,
      capacity: overrides.capacity ?? 1000,
      pressure: overrides.pressure ?? 2,
      type: overrides.type ?? HydrogenStorageType.LIQUID_HYDROGEN,
      filling: overrides.filling ?? HydrogenComponentEntityFixture.createGreen(),
    }) as HydrogenStorageUnitEntity,
} as const;
