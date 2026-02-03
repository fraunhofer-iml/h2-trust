/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyShallowQueryArgs, companySurfaceQueryArgs } from './company.query.args';
import { hydrogenStorageUnitRefShallowQueryArgs, hydrogenStorageUnitRefSurfaceQueryArgs } from './unit.query-args';

export const batchSurfaceQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: true,
    predecessors: true,
    successors: true,
    hydrogenStorageUnit: true,
    batchDetails: true,
    processStep: true,
  },
});

export const batchShallowQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companySurfaceQueryArgs,
    predecessors: true,
    successors: true,
    hydrogenStorageUnit: hydrogenStorageUnitRefSurfaceQueryArgs,
    batchDetails: {
      include: {
        qualityDetails: true,
      },
    },
    processStep: true,
  },
});

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

export const activeBatchShallowQueryArgs = Prisma.validator<Prisma.BatchFindManyArgs>()({
  include: {
    batchDetails: {
      include: {
        qualityDetails: true,
      },
    },
  },
  where: {
    active: true,
  },
});
