import { QualityDetailsEntity } from '@h2-trust/amqp';
import { HydrogenColor } from '@h2-trust/domain';

export const QualityDetailsEntityFixture = {
  createGreen: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.GREEN,
    ),
  createYellow: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.YELLOW,
    ),
  createMix: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.MIX,
    ),
} as const;
