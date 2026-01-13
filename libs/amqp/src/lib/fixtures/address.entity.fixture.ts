import { AddressEntity } from '@h2-trust/amqp';

export const AddressEntityFixture = {
  create: (overrides: Partial<AddressEntity> = {}): AddressEntity =>
    new AddressEntity(
      overrides.street ?? 'Musterstraße 1',
      overrides.postalCode ?? '12345',
      overrides.city ?? 'Musterstadt',
      overrides.state ?? 'NRW',
      overrides.country ?? 'Germany',
    ),
} as const;
