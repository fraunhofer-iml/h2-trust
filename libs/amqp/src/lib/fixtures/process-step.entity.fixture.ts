import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture } from './batch.entity.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { BaseUnitEntityFixture } from './base-unit.entity.fixture';
import { DocumentEntityFixture } from './document.entity.fixture';

export const ProcessStepEntityFixture = {
  create: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-1',
      overrides.startedAt ?? new Date('2026-01-01T00:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.type ?? ProcessType.HYDROGEN_PRODUCTION,
      overrides.batch ?? BatchEntityFixture.create(),
      overrides.recordedBy ?? UserEntityFixture.create(),
      overrides.executedBy ?? BaseUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? undefined,
    ),
} as const;
