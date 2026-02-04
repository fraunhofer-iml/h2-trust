/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchShallowQueryArgs } from '../batch/batch.shallow.query-args';
import { baseUnitShallowQueryArgs } from '../unit/unit.shallow.query-args';
import { userShallowQueryArgs } from '../user/user.shallow.query-args';

export const processStepDeepQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchShallowQueryArgs,
    executedBy: baseUnitShallowQueryArgs,
    recordedBy: userShallowQueryArgs,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});
