/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProofOfOriginSectionEntity } from '@h2-trust/amqp';

export const ProofOfOriginSectionEntityFixture = {
  create: (overrides: Partial<ProofOfOriginSectionEntity> = {}): ProofOfOriginSectionEntity =>
    new ProofOfOriginSectionEntity(
      overrides.name ?? 'Some Section',
      overrides.batches ?? [],
      overrides.classifications ?? [],
    ),
} as const;
