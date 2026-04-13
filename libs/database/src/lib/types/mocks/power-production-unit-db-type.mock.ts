/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { PowerProductionUnitDeepDbType } from '..';
import { PowerProductionTypeSeed, PowerProductionUnitSeed } from '../../../seed';
import { BaseUnitNestedDbTypeMock } from './base-unit-db-type.mock';

export const PowerProductionUnitDeepDbTypeMock = <PowerProductionUnitDeepDbType[]>[
  {
    generalInfo: BaseUnitNestedDbTypeMock[0],
    ...PowerProductionUnitSeed[0],
    type: PowerProductionTypeSeed[0],
  },
];
