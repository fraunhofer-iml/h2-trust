import { ProofOfSustainabilityEmissionEntity } from '@h2-trust/amqp';

export const ProofOfSustainabilityEmissionEntityFixture = {
  create: (overrides: Partial<ProofOfSustainabilityEmissionEntity> = {}): ProofOfSustainabilityEmissionEntity =>
    new ProofOfSustainabilityEmissionEntity(
      overrides.amount ?? 2.5,
      overrides.name ?? 'Power Supply Emission',
      overrides.description ?? 'Emissions from electricity consumption',
      overrides.emissionType ?? 'REGULATORY',
    ),
} as const;
