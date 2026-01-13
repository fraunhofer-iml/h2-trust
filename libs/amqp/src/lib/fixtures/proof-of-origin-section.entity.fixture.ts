import { ProofOfOriginSectionEntity } from '@h2-trust/amqp';

export const ProofOfOriginSectionEntityFixture = {
  create: (overrides: Partial<ProofOfOriginSectionEntity> = {}): ProofOfOriginSectionEntity =>
    new ProofOfOriginSectionEntity(
      overrides.name ?? 'Some Section',
      overrides.batches ?? [],
      overrides.classifications ?? [],
    ),
} as const;
