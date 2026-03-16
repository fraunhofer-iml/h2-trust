/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionBatchSeed } from 'libs/database/src/seed';
import { BatchType } from '@h2-trust/domain';
import { CompanyEntityPowerMock } from '../../company/mocks';
import { BatchEntity } from '../batch.entity';

export const BatchEntityPowerProducedMock: BatchEntity[] = PowerProductionBatchSeed.map(
  (seed) =>
    new BatchEntity(
      seed.id,
      seed.active,
      seed.amount.toNumber(),
      seed.type as BatchType,
      [],
      [],
      CompanyEntityPowerMock,
      undefined,
    ),
);
