/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchHydrogenProducedSeed } from 'libs/database/src/seed';
import { CompanyEntityHydrogenMock } from '../../company/mocks';
import { HydrogenStorageUnitEntityMock } from '../../unit';
import { BatchEntity } from '../batch.entity';

export const BatchEntityHydrogenProducedMock: BatchEntity[] = BatchHydrogenProducedSeed.map(
  (seed) =>
    new BatchEntity(
      seed.id,
      seed.active,
      seed.amount.toNumber(),
      seed.quality,
      seed.type,
      [],
      [],
      CompanyEntityHydrogenMock,
      HydrogenStorageUnitEntityMock[0],
    ),
);
