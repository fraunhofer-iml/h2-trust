/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AddressSeed, BatchSeed, CompanySeed, HydrogenStorageUnitSeed, ProcessStepSeed, UnitSeed } from '../../../seed';
import { ProcessStepDbType } from '../process-step.db.type';
import { UserDbTypeMock } from './user-db-type.mock';

export const ProcessStepDbTypeMock = <ProcessStepDbType[]>[
  {
    ...ProcessStepSeed[1],
    batch: {
      ...BatchSeed[1],
      owner: {
        ...CompanySeed[1],
        address: AddressSeed[1],
      },
      predecessors: [],
      successors: [],
      hydrogenStorageUnit: {
        generalInfo: {
          ...UnitSeed[5],
        },
        ...HydrogenStorageUnitSeed[1],
      },
      processStep: null,
    },
    executedBy: {
      ...UnitSeed[4],
      address: AddressSeed[1],
      owner: {
        ...CompanySeed[1],
        address: AddressSeed[1],
        hydrogenApprovals: [],
      },
    },
    recordedBy: UserDbTypeMock[1],
    documents: [],
    processStepDetails: null,
  },
];
