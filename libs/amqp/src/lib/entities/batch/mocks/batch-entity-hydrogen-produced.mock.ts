/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionBatchSeed } from 'libs/database/src/seed';
import { CompanyEntityHydrogenMock } from '../../company/mocks';
import { HydrogenStorageUnitEntityMock } from '../../unit';
import { BatchEntity } from '../batch.entity';
import { QualityDetailsEntityMock } from './quality-details-entity.mock';

export const BatchEntityHydrogenProducedMock: BatchEntity[] = HydrogenProductionBatchSeed.map(
  (seed) =>
    new BatchEntity(
      seed.id,
      seed.active,
      seed.amount.toNumber(),
      seed.type,
      [],
      [],
      CompanyEntityHydrogenMock,
      HydrogenStorageUnitEntityMock[0],
      QualityDetailsEntityMock[0],
    ),
);
