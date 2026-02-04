/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyShallowQueryArgs } from '../company/company.shallow.query-args';
import { hydrogenStorageUnitRefShallowQueryArgs } from '../unit/unit.shallow.query-args';
import { batchShallowQueryArgs } from './batch.shallow.query-args';

export const batchDeepQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companyShallowQueryArgs,
    predecessors: batchShallowQueryArgs,
    successors: batchShallowQueryArgs,
    hydrogenStorageUnit: hydrogenStorageUnitRefShallowQueryArgs,
    batchDetails: {
      include: {
        qualityDetails: true,
      },
    },
    processStep: true,
  },
});
