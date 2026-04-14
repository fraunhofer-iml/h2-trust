/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { BatchDetailsSeed, BatchSeed, HydrogenProductionBatchSeed, QualityDetailsSeed } from '../../../seed';
import { BatchDeepDbType, BatchFlatDbType } from '../batch.db.type';
import { BaseUnitNestedDbTypeMock } from './base-unit-db-type.mock';
import { CompanyNestedDbTypeMock } from './company-db-type.mock';

export const BatchDeepDbTypeMock = <BatchDeepDbType[]>[
  {
    ...BatchSeed[1],
    owner: CompanyNestedDbTypeMock[1],
    predecessors: [],
    successors: [],
    hydrogenStorageUnit: BaseUnitNestedDbTypeMock[0].hydrogenStorageUnit,
    batchDetails: null,
    processStep: null,
  },
];

export const BatchFlatDbTypeMock = <BatchFlatDbType>{
  ...HydrogenProductionBatchSeed[0],
  batchDetails: {
    ...BatchDetailsSeed[0],
    qualityDetails: QualityDetailsSeed[0],
  },
};
