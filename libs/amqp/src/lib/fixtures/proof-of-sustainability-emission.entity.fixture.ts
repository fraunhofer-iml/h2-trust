/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfSustainabilityEmissionEntity } from '@h2-trust/amqp';

export const ProofOfSustainabilityEmissionEntityFixture = {
  create: (overrides: Partial<ProofOfSustainabilityEmissionEntity> = {}): ProofOfSustainabilityEmissionEntity =>
    new ProofOfSustainabilityEmissionEntity(
      overrides.amount ?? 2.5,
      overrides.name ?? 'Power Supply Emission',
      overrides.description ?? 'Emissions from electricity consumption',
      overrides.emissionType ?? 'REGULATORY',
    ),
} as const;
