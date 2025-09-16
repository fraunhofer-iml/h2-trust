/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchPowerProducedSeed } from 'libs/database/src/seed';
import { CompanyEntityPowerMock } from '../../company/mocks';
import { BatchEntity } from '../batch.entity';

export const BatchEntityPowerProducedMock: BatchEntity[] = BatchPowerProducedSeed.map(
  (seed) =>
    new BatchEntity(
      seed.id,
      seed.active,
      seed.amount.toNumber(),
      seed.quality,
      seed.type,
      [],
      [],
      CompanyEntityPowerMock,
      undefined,
    ),
);
