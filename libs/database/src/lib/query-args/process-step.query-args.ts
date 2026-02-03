/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchShallowQueryArgs, batchSurfaceQueryArgs } from './batch.query-args';
import { baseUnitSurfaceQueryArgs } from './unit.query-args';
import { userShallowQueryArgs, userSurfaceQueryArgs } from './user.query-args';

export const processStepDeepQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchShallowQueryArgs,
    executedBy: baseUnitSurfaceQueryArgs,
    recordedBy: userShallowQueryArgs,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});

export const processStepShallowQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchSurfaceQueryArgs,
    executedBy: baseUnitSurfaceQueryArgs,
    recordedBy: userSurfaceQueryArgs,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});

export const processStepSurfaceQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: true,
    executedBy: true,
    recordedBy: true,
    documents: true,
    processStepDetails: true,
  },
});
