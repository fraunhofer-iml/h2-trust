import { QualityDetailsEntity } from '@h2-trust/amqp';
import { HydrogenColor } from '@h2-trust/domain';

export const QualityDetailsEntityFixture = {
  create: (overrides: Partial<QualityDetailsEntity> = {}): QualityDetailsEntity =>
    new QualityDetailsEntity(
      overrides.id ?? 'quality-details-1',
      overrides.color ?? HydrogenColor.GREEN,
    ),
} as const;
