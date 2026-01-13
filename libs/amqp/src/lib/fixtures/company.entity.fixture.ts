import { CompanyEntity } from '@h2-trust/amqp';
import { AddressEntityFixture } from './address.entity.fixture';

export const CompanyEntityFixture = {
  create: (overrides: Partial<CompanyEntity> = {}): CompanyEntity =>
    new CompanyEntity(
      overrides.id ?? 'company-1',
      overrides.name ?? 'Dummy Company',
      overrides.mastrNumber ?? 'MASTR-001',
      overrides.type ?? 'HYDROGEN_PRODUCER',
      overrides.address ?? AddressEntityFixture.create(),
      overrides.users ?? [],
    ),
} as const;
