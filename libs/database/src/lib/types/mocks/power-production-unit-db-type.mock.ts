/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitDbType } from '..';
import { PowerProductionUnitSeed } from '../../../seed';
import { BaseUnitShallowDbTypeMock } from './base-unit-db-type.mock';

export const PowerProductionUnitDbTypeMock = <PowerProductionUnitDbType[]>[
  {
    ...BaseUnitShallowDbTypeMock[0],
    powerProductionUnit: PowerProductionUnitSeed[0],
  },
];
