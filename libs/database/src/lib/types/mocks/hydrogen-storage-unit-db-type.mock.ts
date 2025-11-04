/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitDbType } from '..';
import { HydrogenProductionBatchSeed, HydrogenStorageUnitSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenStorageUnitDbTypeMock = <HydrogenStorageUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenStorageUnit: {
      ...HydrogenStorageUnitSeed[0],
      filling: [HydrogenProductionBatchSeed[0]],
    },
  },
];
