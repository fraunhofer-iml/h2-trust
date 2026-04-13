/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { HydrogenStorageUnitSeed } from '../../../seed';
import { HydrogenStorageUnitNestedDbType } from '../hydrogen-storage-unit.db.type';
import { BaseUnitFlatDbTypeMock } from './base-unit-db-type.mock';
import { BatchFlatDbTypeMock } from './batch-db-type.mock';

export const HydrogenStorageUnitNestedDbTypeMock = <HydrogenStorageUnitNestedDbType[]>[
  {
    generalInfo: BaseUnitFlatDbTypeMock[0],
    ...HydrogenStorageUnitSeed[0],
    filling: [BatchFlatDbTypeMock],
  },
];
