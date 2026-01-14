import { GeneralInformationEntity } from '@h2-trust/amqp';
import { HydrogenComponentEntityFixture } from './hydrogen-component.entity.fixture';
import { DocumentEntityFixture } from './document.entity.fixture';
import { RedComplianceEntityFixture } from './red-compliance.entity.fixture';
import { HydrogenColor } from '@h2-trust/domain';

export const GeneralInformationEntityFixture = {
  create: (overrides: Partial<GeneralInformationEntity> = {}): GeneralInformationEntity =>
    new GeneralInformationEntity(
      overrides.id ?? 'process-step-1',
      overrides.filledAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.owner ?? 'Dummy Owner',
      overrides.filledAmount ?? 100,
      overrides.color ?? HydrogenColor.GREEN,
      overrides.producer ?? 'Dummy Producer',
      overrides.hydrogenComposition ?? [HydrogenComponentEntityFixture.createGreen()],
      overrides.attachedFiles ?? [DocumentEntityFixture.create()],
      overrides.redCompliance ?? RedComplianceEntityFixture.create(),
    ),
} as const;