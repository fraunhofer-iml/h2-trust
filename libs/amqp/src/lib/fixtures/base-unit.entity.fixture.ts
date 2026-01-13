import { BaseUnitEntity } from '@h2-trust/amqp';
import { UnitType } from '@h2-trust/domain';
import { AddressEntityFixture } from './address.entity.fixture';
import { CompanyEntityFixture } from './company.entity.fixture';

export const BaseUnitEntityFixture = {
  create: (overrides: Partial<BaseUnitEntity> = {}): BaseUnitEntity =>
    ({
      id: overrides.id ?? 'unit-1',
      name: overrides.name ?? 'Dummy Unit',
      mastrNumber: overrides.mastrNumber ?? 'MASTR-UNIT-001',
      manufacturer: overrides.manufacturer ?? 'Dummy Manufacturer',
      modelType: overrides.modelType ?? 'MT-001',
      modelNumber: overrides.modelNumber ?? 'MN-001',
      serialNumber: overrides.serialNumber ?? 'SN-001',
      certifiedBy: overrides.certifiedBy ?? 'TÜV',
      commissionedOn: overrides.commissionedOn ?? new Date('2025-01-01'),
      address: overrides.address ?? AddressEntityFixture.create(),
      company: overrides.company ?? { id: 'company-1' },
      operator: overrides.operator ?? CompanyEntityFixture.create(),
      unitType: overrides.unitType ?? UnitType.HYDROGEN_PRODUCTION,
    }) as BaseUnitEntity,
} as const;
