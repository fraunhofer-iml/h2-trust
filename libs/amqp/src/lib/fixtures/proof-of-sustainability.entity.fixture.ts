/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityEntity } from '@h2-trust/amqp';
import { ProofOfSustainabilityEmissionCalculationEntityFixture } from './proof-of-sustainability-emission-calculation.entity.fixture';
import { ProofOfSustainabilityEmissionEntityFixture } from './proof-of-sustainability-emission.entity.fixture';

export const ProofOfSustainabilityEntityFixture = {
  create: (overrides: Partial<ProofOfSustainabilityEntity> = {}): ProofOfSustainabilityEntity =>
    new ProofOfSustainabilityEntity(
      overrides.batchId ?? 'batch-1',
      overrides.totalEmissions ?? 1,
      overrides.amountCO2PerKgH2 ?? 1,
      overrides.amountCO2PerMJH2 ?? 0.5,
      overrides.emissionReductionPercentage ?? 85,
      overrides.calculations ?? [ProofOfSustainabilityEmissionCalculationEntityFixture.create()],
      overrides.emissions ?? [ProofOfSustainabilityEmissionEntityFixture.create()],
    ),
} as const;
