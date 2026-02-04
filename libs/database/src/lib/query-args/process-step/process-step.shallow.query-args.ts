/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchSurfaceQueryArgs } from '../batch/batch.surface.query-args';
import { baseUnitSurfaceQueryArgs } from '../unit/unit.surface.query-args';
import { userSurfaceQueryArgs } from '../user/user.surface.query-args';

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
