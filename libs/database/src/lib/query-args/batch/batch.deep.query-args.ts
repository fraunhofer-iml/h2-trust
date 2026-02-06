/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyNestedQueryArgs } from '../company/company.nested.query-args';
import { hydrogenStorageUnitNestedQueryArgs } from '../unit/unit.nested.query-args';
import { batchNestedQueryArgs } from './batch.nested.query-args';

export const batchDeepQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companyNestedQueryArgs,
    predecessors: batchNestedQueryArgs,
    successors: batchNestedQueryArgs,
    hydrogenStorageUnit: hydrogenStorageUnitNestedQueryArgs,
    batchDetails: {
      include: {
        qualityDetails: true,
      },
    },
    processStep: true,
  },
});
