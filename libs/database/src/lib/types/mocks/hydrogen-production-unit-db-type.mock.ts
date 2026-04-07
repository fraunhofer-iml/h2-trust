/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenProductionUnitSeed } from '../../../seed';
import { HydrogenProductionUnitDeepDbType } from '../hydrogen-production-unit.db.type';
import { BaseUnitNestedDbTypeMock } from './base-unit-db-type.mock';

export const HydrogenProductionUnitDeepDbTypeMock = <HydrogenProductionUnitDeepDbType[]>[
  {
    generalInfo: BaseUnitNestedDbTypeMock[0],
    ...HydrogenProductionUnitSeed[0],
  },
];
