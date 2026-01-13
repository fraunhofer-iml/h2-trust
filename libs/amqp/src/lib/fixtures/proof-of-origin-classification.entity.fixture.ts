import {
  ProofOfOriginClassificationEntity,
  ProofOfOriginSubClassificationEntity,
} from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';

export const ProofOfOriginSubClassificationEntityFixture = {
  create: (overrides: Partial<ProofOfOriginSubClassificationEntity> = {}): ProofOfOriginSubClassificationEntity =>
    new ProofOfOriginSubClassificationEntity(
      overrides.name ?? 'Solar Energy',
      overrides.emissionOfProcessStep ?? 5.0,
      overrides.amount ?? 500,
      overrides.unit ?? 'kWh',
      overrides.classificationType ?? BatchType.POWER,
      overrides.batches ?? [],
    ),
} as const;

export const ProofOfOriginClassificationEntityFixture = {
  create: (overrides: Partial<ProofOfOriginClassificationEntity> = {}): ProofOfOriginClassificationEntity =>
    new ProofOfOriginClassificationEntity(
      overrides.name ?? 'Power Supply',
      overrides.emissionOfProcessStep ?? 10.0,
      overrides.amount ?? 1000,
      overrides.unit ?? 'kWh',
      overrides.classificationType ?? BatchType.POWER,
      overrides.batches ?? [],
      overrides.subClassifications ?? [],
    ),
} as const;
