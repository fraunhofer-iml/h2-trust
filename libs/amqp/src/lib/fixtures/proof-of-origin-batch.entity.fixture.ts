/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProofOfOriginHydrogenBatchEntity,
  ProofOfOriginPowerBatchEntity,
  ProofOfOriginWaterBatchEntity,
} from '@h2-trust/amqp';
import { EnergySource, HydrogenColor } from '@h2-trust/domain';
import { HydrogenComponentEntityFixture } from './hydrogen-component.entity.fixture';
import { ProofOfOriginEmissionEntityFixture } from './proof-of-origin-emission.entity.fixture';

export const ProofOfOriginPowerBatchEntityFixture = {
  create: (overrides: Partial<ProofOfOriginPowerBatchEntity> = {}): ProofOfOriginPowerBatchEntity =>
    new ProofOfOriginPowerBatchEntity(
      overrides.id ?? 'power-batch-1',
      overrides.emission ?? ProofOfOriginEmissionEntityFixture.create(),
      overrides.createdAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.amount ?? 100,
      overrides.unit ?? 'kWh',
      overrides.producer ?? 'The Power Company',
      overrides.unitId ?? 'power-production-unit-1',
      overrides.energySource ?? EnergySource.SOLAR_ENERGY,
      overrides.accountingPeriodEnd ?? new Date('2026-12-31T23:59:59Z'),
    ),
} as const;

export const ProofOfOriginWaterBatchEntityFixture = {
  create: (overrides: Partial<ProofOfOriginWaterBatchEntity> = {}): ProofOfOriginWaterBatchEntity =>
    new ProofOfOriginWaterBatchEntity(
      overrides.id ?? 'water-batch-1',
      overrides.emission ?? ProofOfOriginEmissionEntityFixture.create(),
      overrides.createdAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.amount ?? 20,
      overrides.unit ?? 'L',
      overrides.deionizedWaterAmount ?? 100,
      overrides.deionizedWaterEmission ?? ProofOfOriginEmissionEntityFixture.create(),
    ),
} as const;

export const ProofOfOriginHydrogenBatchEntityFixture = {
  create: (overrides: Partial<ProofOfOriginHydrogenBatchEntity> = {}): ProofOfOriginHydrogenBatchEntity =>
    new ProofOfOriginHydrogenBatchEntity(
      overrides.id ?? 'hydrogen-batch-1',
      overrides.emission ?? ProofOfOriginEmissionEntityFixture.create(),
      overrides.createdAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.amount ?? 50,
      overrides.unit ?? 'kg',
      overrides.hydrogenComposition ?? [HydrogenComponentEntityFixture.createGreen()],
      overrides.producer ?? 'The Hydrogen Company',
      overrides.unitId ?? 'hydrogen-production-unit-1',
      overrides.color ?? HydrogenColor.GREEN,
      overrides.processStep ?? 'process-step-1',
      overrides.accountingPeriodEnd ?? new Date('2026-12-31T23:59:59Z'),
    ),
} as const;
