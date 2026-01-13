import { BatchEntity } from '@h2-trust/amqp';
import { BatchType } from '@h2-trust/domain';
import { CompanyEntityFixture } from './company.entity.fixture';
import { QualityDetailsEntityFixture } from './quality-details.entity.fixture';

export const BatchEntityFixture = {
  create: (overrides: Partial<BatchEntity> = {}): BatchEntity =>
    new BatchEntity(
      overrides.id ?? 'batch-1',
      overrides.active ?? true,
      overrides.amount ?? 100,
      overrides.type ?? BatchType.PRODUCED,
      overrides.predecessors ?? [],
      overrides.successors ?? [],
      overrides.owner ?? CompanyEntityFixture.create(),
      overrides.hydrogenStorageUnit ?? undefined,
      overrides.qualityDetails ?? QualityDetailsEntityFixture.create(),
      overrides.processStepId ?? 'process-step-1',
    ),
} as const;
