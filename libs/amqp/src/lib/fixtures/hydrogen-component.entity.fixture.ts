import { HydrogenComponentEntity } from '@h2-trust/amqp';
import { HydrogenColor } from '@h2-trust/domain';

export const HydrogenComponentEntityFixture = {
  create: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      overrides.color ?? HydrogenColor.GREEN,
      overrides.amount ?? 100,
    ),
} as const;
