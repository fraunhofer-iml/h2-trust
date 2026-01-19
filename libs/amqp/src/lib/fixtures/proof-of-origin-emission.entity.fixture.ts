/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginEmissionEntity } from '@h2-trust/amqp';

export const ProofOfOriginEmissionEntityFixture = {
  create: (overrides: Partial<ProofOfOriginEmissionEntity> = {}): ProofOfOriginEmissionEntity =>
    new ProofOfOriginEmissionEntity(
      overrides.amountCO2 ?? 10.5,
      overrides.amountCO2PerKgH2 ?? 0.5,
      overrides.basisOfCalculation ?? ['ISO 14044', 'RED II'],
    ),
} as const;
