import { ProofOfOriginEmissionEntity } from '@h2-trust/amqp';

export const ProofOfOriginEmissionEntityFixture = {
  create: (overrides: Partial<ProofOfOriginEmissionEntity> = {}): ProofOfOriginEmissionEntity =>
    new ProofOfOriginEmissionEntity(
      overrides.amountCO2 ?? 10.5,
      overrides.amountCO2PerKgH2 ?? 0.5,
      overrides.basisOfCalculation ?? ['ISO 14044', 'RED II'],
    ),
} as const;
