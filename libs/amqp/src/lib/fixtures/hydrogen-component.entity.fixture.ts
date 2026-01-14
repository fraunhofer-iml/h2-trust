import { HydrogenComponentEntity } from '@h2-trust/amqp';
import { HydrogenColor } from '@h2-trust/domain';

export const HydrogenComponentEntityFixture = {
  createGreen: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      overrides.color ?? HydrogenColor.GREEN,
      overrides.amount ?? 100,
    ),
  createYellow: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      overrides.color ?? HydrogenColor.YELLOW,
      overrides.amount ?? 100,
    ),
  createMix: (overrides: Partial<HydrogenComponentEntity> = {}): HydrogenComponentEntity =>
    new HydrogenComponentEntity(
      overrides.color ?? HydrogenColor.MIX,
      overrides.amount ?? 100,
    ),
} as const;
