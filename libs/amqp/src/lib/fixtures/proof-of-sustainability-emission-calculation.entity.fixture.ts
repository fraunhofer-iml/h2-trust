import { ProofOfSustainabilityEmissionCalculationEntity } from '@h2-trust/amqp';
import { CalculationTopic } from '@h2-trust/domain';

export const ProofOfSustainabilityEmissionCalculationEntityFixture = {
  create: (
    overrides: Partial<ProofOfSustainabilityEmissionCalculationEntity> = {},
  ): ProofOfSustainabilityEmissionCalculationEntity =>
    new ProofOfSustainabilityEmissionCalculationEntity(
      overrides.name ?? 'Power Supply Calculation',
      overrides.basisOfCalculation ?? ['ISO 14044', 'RED II'],
      overrides.result ?? 1.5,
      overrides.unit ?? 'gCO2eq/MJ',
      overrides.calculationTopic ?? CalculationTopic.POWER_SUPPLY,
    ),
} as const;
