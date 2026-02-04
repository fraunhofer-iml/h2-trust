/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companySurfaceQueryArgs } from '../company/company.surface.query-args';
import { hydrogenStorageUnitRefSurfaceQueryArgs } from '../unit/unit.surface.query-args';
import { batchSurfaceQueryArgs } from './batch.surface.query-args';

export const batchShallowQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companySurfaceQueryArgs,
    predecessors: batchSurfaceQueryArgs,
    successors: batchSurfaceQueryArgs,
    hydrogenStorageUnit: hydrogenStorageUnitRefSurfaceQueryArgs,
    batchDetails: {
      include: {
        qualityDetails: true,
      },
    },
    processStep: true,
  },
});
