import { UserEntity } from '@h2-trust/amqp';
import { CompanyEntityFixture } from './company.entity.fixture';

export const UserEntityFixture = {
  create: (overrides: Partial<UserEntity> = {}): UserEntity =>
    new UserEntity(
      overrides.id ?? 'user-1',
      overrides.name ?? 'Dummy User',
      overrides.email ?? 'dummy@example.com',
      overrides.company ?? CompanyEntityFixture.createHydrogenProducer(),
    ),
} as const;
