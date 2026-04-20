/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessStepEntity } from '@h2-trust/contracts';
import { ProcessType } from '@h2-trust/domain';
import { BatchEntityFixture } from '../../batch/fixtures/batch.fixture';
import { DocumentEntityFixture } from '../../document/fixtures/document.fixture';
import { HydrogenProductionUnitEntityFixture } from '../../unit/fixtures/hydrogen-production-unit.fixture';
import { HydrogenStorageUnitEntityFixture } from '../../unit/fixtures/hydrogen-storage-unit.fixture';
import { PowerProductionUnitEntityFixture } from '../../unit/fixtures/power-production-unit.fixture';
import { TransportationDetailsEntityFixture } from './transportation-details.fixture';
import { UserEntityFixture } from '../../user/fixtures/user.fixture';

export const ProcessStepEntityFixture = {
  createPowerProduction: (overrides: Partial<ProcessStepEntity> = {}): ProcessStepEntity =>
    new ProcessStepEntity(
      overrides.id ?? 'process-step-1',
      overrides.startedAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.endedAt ?? new Date('2026-01-01T01:59:59Z'),
      overrides.type ?? ProcessType.POWER_PRODUCTION,
      overrides.batch ?? BatchEntityFixture.createPowerBatch(),
      overrides.recordedBy ?? UserEntityFixture.createPowerUser(),
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
      overrides.recordedBy ?? UserEntityFixture.createHydrogenUser(),
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
      overrides.recordedBy ?? UserEntityFixture.createHydrogenUser(),
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
      overrides.recordedBy ?? UserEntityFixture.createHydrogenUser(),
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
      overrides.recordedBy ?? UserEntityFixture.createHydrogenUser(),
      overrides.executedBy ?? HydrogenStorageUnitEntityFixture.create(),
      overrides.documents ?? [DocumentEntityFixture.create()],
      overrides.transportationDetails ?? TransportationDetailsEntityFixture.createPipeline(),
    ),
} as const;
