/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDetailsSeed, BatchSeed, HydrogenProductionBatchSeed } from '../../../seed';
import { BatchDeepDbType, BatchFlatDbType } from '../batch.db.type';
import { CompanyNestedDbTypeMock } from './company-db-type.mock';

export const BatchDeepDbTypeMock = <BatchDeepDbType[]>[
  {
    ...BatchSeed[1],
    owner: CompanyNestedDbTypeMock[1],
    predecessors: [],
    successors: [],
    batchDetails: null,
    processStep: null,
  },
];

export const BatchFlatDbTypeMock = <BatchFlatDbType>{
  ...HydrogenProductionBatchSeed[0],
  qualityDetails: {
    ...BatchDetailsSeed[0],
  },
};
