/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchEntity } from '@h2-trust/amqp';
import { BatchType, RFNBOType } from '@h2-trust/domain';
import { CompanyEntityFixture } from './company.entity.fixture';
import { QualityDetailsEntityFixture } from './quality-details.entity.fixture';

export const BatchEntityFixture = {
  createPowerBatch: (overrides: Partial<BatchEntity> = {}): BatchEntity =>
    new BatchEntity(
      overrides.id ?? 'batch-1',
      overrides.active ?? true,
      overrides.amount ?? 2,
      overrides.type ?? BatchType.POWER,
      overrides.predecessors ?? [],
      overrides.successors ?? [],
      overrides.owner ?? CompanyEntityFixture.createPowerProducer(),
      overrides.hydrogenStorageUnit ?? undefined,
      overrides.qualityDetails ?? QualityDetailsEntityFixture.createGreen(),
      overrides.processStepId ?? 'process-step-1',
      overrides.rfnboType ?? RFNBOType.RFNBO_READY,
    ),
  createWaterBatch: (overrides: Partial<BatchEntity> = {}): BatchEntity =>
    new BatchEntity(
      overrides.id ?? 'batch-2',
      overrides.active ?? true,
      overrides.amount ?? 4,
      overrides.type ?? BatchType.POWER,
      overrides.predecessors ?? [],
      overrides.successors ?? [],
      overrides.owner ?? CompanyEntityFixture.createPowerProducer(),
      overrides.hydrogenStorageUnit ?? undefined,
      overrides.qualityDetails ?? QualityDetailsEntityFixture.createGreen(),
      overrides.processStepId ?? 'process-step-2',
      overrides.rfnboType ?? RFNBOType.RFNBO_READY,
    ),
  createHydrogenBatch: (overrides: Partial<BatchEntity> = {}): BatchEntity =>
    new BatchEntity(
      overrides.id ?? 'batch-3',
      overrides.active ?? true,
      overrides.amount ?? 1,
      overrides.type ?? BatchType.HYDROGEN,
      overrides.predecessors ?? [],
      overrides.successors ?? [],
      overrides.owner ?? CompanyEntityFixture.createHydrogenProducer(),
      overrides.hydrogenStorageUnit ?? undefined,
      overrides.qualityDetails ?? QualityDetailsEntityFixture.createGreen(),
      overrides.processStepId ?? 'process-step-3',
      overrides.rfnboType ?? RFNBOType.RFNBO_READY,
    ),
} as const;
