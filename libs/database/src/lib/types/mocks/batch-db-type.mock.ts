/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchSeed } from '../../../seed';
import { BatchDeepDbType } from '../batch.db.type';
import { CompanyNestedDbTypeMock } from './company-db-type.mock';
import { HydrogenStorageUnitNestedDbTypeMock } from './hydrogen-storage-unit-db-type.mock';

export const BatchDeepDbTypeMock = <BatchDeepDbType[]>[
  {
    ...BatchSeed[1],
    owner: CompanyNestedDbTypeMock[1],
    predecessors: [],
    successors: [],
    hydrogenStorageUnit: HydrogenStorageUnitNestedDbTypeMock[0],
    batchDetails: null,
    processStep: null,
  },
];
