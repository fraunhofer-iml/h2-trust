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
} from '@h2-trust/contracts/entities';
import { EnergySource, HydrogenColor, PowerType, RfnboType } from '@h2-trust/domain';
import { HydrogenComponentEntityFixture } from '../../../bottling/fixtures/hydrogen-component.fixture';
import { ProofOfOriginEmissionEntityFixture } from './proof-of-origin-emission.fixture';

export const ProofOfOriginPowerBatchEntityFixture = {
  create: (overrides: Partial<ProofOfOriginPowerBatchEntity> = {}): ProofOfOriginPowerBatchEntity =>
    new ProofOfOriginPowerBatchEntity(
      overrides.id ?? 'power-batch-1',
      overrides.emission ?? ProofOfOriginEmissionEntityFixture.create(),
      overrides.createdAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.amount ?? 100,
      overrides.producer ?? 'The Power Company',
      overrides.unitId ?? 'power-production-unit-1',
      overrides.energySource ?? EnergySource.SOLAR_ENERGY,
      overrides.accountingPeriodEnd ?? new Date('2026-12-31T23:59:59Z'),
      overrides.powerType ?? PowerType.RENEWABLE,
    ),
} as const;

export const ProofOfOriginWaterBatchEntityFixture = {
  create: (overrides: Partial<ProofOfOriginWaterBatchEntity> = {}): ProofOfOriginWaterBatchEntity =>
    new ProofOfOriginWaterBatchEntity(
      overrides.id ?? 'water-batch-1',
      overrides.emission ?? ProofOfOriginEmissionEntityFixture.create(),
      overrides.createdAt ?? new Date('2026-01-01T01:00:00Z'),
      overrides.amount ?? 20,
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
      overrides.hydrogenComposition ?? [HydrogenComponentEntityFixture.createGreen()],
      overrides.producer ?? 'The Hydrogen Company',
      overrides.unitId ?? 'hydrogen-production-unit-1',
      overrides.color ?? HydrogenColor.GREEN,
      overrides.rfnboType ?? RfnboType.RFNBO_READY,
      overrides.processStep ?? 'process-step-1',
      overrides.accountingPeriodEnd ?? new Date('2026-12-31T23:59:59Z'),
    ),
} as const;
