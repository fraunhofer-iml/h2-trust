/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressSeed, ProcessStepSeed, UnitSeed } from '../../../seed';
import { ProcessStepDeepDbType } from '../process-step.db.type';
import { BatchDeepDbTypeMock } from './batch-db-type.mock';
import { CompanyShallowDbTypeMock } from './company-db-type.mock';
import { UserShallowDbTypeMock } from './user-db-type.mock';

export const ProcessStepDeepDbTypeMock = <ProcessStepDeepDbType[]>[
  {
    ...ProcessStepSeed[1],
    batch: BatchDeepDbTypeMock[0],
    executedBy: {
      ...UnitSeed[4],
      address: AddressSeed[1],
      owner: CompanyShallowDbTypeMock[1],
      operator: CompanyShallowDbTypeMock[1],
    },
    recordedBy: UserShallowDbTypeMock[1],
    documents: [],
    processStepDetails: null,
  },
];
