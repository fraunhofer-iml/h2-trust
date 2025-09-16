/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitDbType } from '..';
import { HydrogenProductionUnitSeed, HydrogenStorageUnitSeed, UnitSeed } from '../../../seed';
import { BaseUnitDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenProductionUnitDbTypeMock = <HydrogenProductionUnitDbType[]>[
  {
    ...BaseUnitDbTypeMock[0],
    hydrogenProductionUnit: {
      ...HydrogenProductionUnitSeed[0],
      hydrogenStorageUnit: {
        ...HydrogenStorageUnitSeed[0],
        generalInfo: UnitSeed[5],
      },
    },
  },
];
