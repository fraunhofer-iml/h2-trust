import { ProcessStepEntity } from '@h2-trust/amqp';
import { ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture } from './batch.entity.fixture';
import { UserEntityFixture } from './user.entity.fixture';
import { DocumentEntityFixture } from './document.entity.fixture';
import { PowerProductionUnitEntityFixture } from './power-production-unit.entity.fixture';
import { HydrogenProductionUnitEntityFixture } from './hydrogen-production-unit.entity.fixture';
import { HydrogenStorageUnitEntityFixture } from './hydrogen-storage-unit.entity.fixture';

export const ProcessStepEntityFixture = {
  createPowerProduction: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-1',
      overrides.startedAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T01:59:59Z'),
      overrides.type ?? ProcessType.POWER_PRODUCTION,
      overrides.batch ?? BatchEntityFixture.createPowerBatch(),
      overrides.recordedBy ?? UserEntityFixture.create(),
      overrides.executedBy ?? PowerProductionUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? undefined,
    ),
  createWaterConsumption: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-2',
      overrides.startedAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T01:59:59Z'),
      overrides.type ?? ProcessType.WATER_CONSUMPTION,
      overrides.batch ?? BatchEntityFixture.createWaterBatch(),
      overrides.recordedBy ?? UserEntityFixture.create(),
      overrides.executedBy ?? PowerProductionUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? undefined,
    ),
  createHydrogenProduction: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-3',
      overrides.startedAt ?? new Date('2026-01-01T02:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T02:59:59Z'),
      overrides.type ?? ProcessType.HYDROGEN_PRODUCTION,
      overrides.batch ?? BatchEntityFixture.createHydrogenBatch({ id: 'batch-3', processStepId: 'process-step-3' }),
      overrides.recordedBy ?? UserEntityFixture.create(),
      overrides.executedBy ?? HydrogenProductionUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? undefined,
    ),
  createHydrogenBottling: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-4',
      overrides.startedAt ?? new Date('2026-01-01T03:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T03:59:59Z'),
      overrides.type ?? ProcessType.HYDROGEN_BOTTLING,
      overrides.batch ?? BatchEntityFixture.createHydrogenBatch({ id: 'batch-4', processStepId: 'process-step-4' }),
      overrides.recordedBy ?? UserEntityFixture.create(),
      overrides.executedBy ?? HydrogenStorageUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? undefined,
    ),
  createHydrogenTransportation: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-5',
      overrides.startedAt ?? new Date('2026-01-01T04:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T04:59:59Z'),
      overrides.type ?? ProcessType.HYDROGEN_TRANSPORTATION,
      overrides.batch ?? BatchEntityFixture.createHydrogenBatch({ id: 'batch-5', processStepId: 'process-step-5' }),
      overrides.recordedBy ?? UserEntityFixture.create(),
      overrides.executedBy ?? HydrogenStorageUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? undefined,
    ),
} as const;
