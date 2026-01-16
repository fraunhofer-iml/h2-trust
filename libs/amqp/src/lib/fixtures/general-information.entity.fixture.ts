/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeneralInformationEntity } from '@h2-trust/amqp';
import { HydrogenColor } from '@h2-trust/domain';
import { DocumentEntityFixture } from './document.entity.fixture';
import { HydrogenComponentEntityFixture } from './hydrogen-component.entity.fixture';
import { RedComplianceEntityFixture } from './red-compliance.entity.fixture';

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
