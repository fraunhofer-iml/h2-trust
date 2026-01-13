import { ProofOfSustainabilityEntity } from '@h2-trust/amqp';
import { ProofOfSustainabilityEmissionCalculationEntityFixture } from './proof-of-sustainability-emission-calculation.entity.fixture';
import { ProofOfSustainabilityEmissionEntityFixture } from './proof-of-sustainability-emission.entity.fixture';

export const ProofOfSustainabilityEntityFixture = {
  create: (overrides: Partial<ProofOfSustainabilityEntity> = {}): ProofOfSustainabilityEntity =>
    new ProofOfSustainabilityEntity(
      overrides.batchId ?? 'batch-1',
      overrides.amountCO2PerMJH2 ?? 0.5,
      overrides.emissionReductionPercentage ?? 85,
      overrides.calculations ?? [ProofOfSustainabilityEmissionCalculationEntityFixture.create()],
      overrides.emissions ?? [ProofOfSustainabilityEmissionEntityFixture.create()],
    ),
} as const;
