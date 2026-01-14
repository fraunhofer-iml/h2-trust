import { CompanyEntity } from '@h2-trust/amqp';
import { AddressEntityFixture } from './address.entity.fixture';
import { CompanyType } from '@h2-trust/domain';

export const CompanyEntityFixture = {
  createPowerProducer: (overrides: Partial<CompanyEntity> = {}): CompanyEntity =>
    new CompanyEntity(
      overrides.id ?? 'company-1',
      overrides.name ?? 'Power Company',
      overrides.mastrNumber ?? 'MASTR-001',
      overrides.type ?? CompanyType.POWER_PRODUCER,
      overrides.address ?? AddressEntityFixture.create(),
      overrides.users ?? [],
    ),
  createHydrogenProducer: (overrides: Partial<CompanyEntity> = {}): CompanyEntity =>
    new CompanyEntity(
      overrides.id ?? 'company-2',
      overrides.name ?? 'Hydrogen Company',
      overrides.mastrNumber ?? 'MASTR-002',
      overrides.type ?? CompanyType.HYDROGEN_PRODUCER,
      overrides.address ?? AddressEntityFixture.create(),
      overrides.users ?? [],
    ),
} as const;
