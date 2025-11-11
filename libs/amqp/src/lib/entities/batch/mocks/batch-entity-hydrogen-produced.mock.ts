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
import { QualityDetailsEntity } from '../quality-details.entity';
import { HydrogenColor } from '@h2-trust/domain';

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
      new QualityDetailsEntity('qd-0', HydrogenColor.GREEN),
    ),
);
