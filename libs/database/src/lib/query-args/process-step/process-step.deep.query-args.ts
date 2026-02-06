/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchNestedQueryArgs } from '../batch/batch.nested.query-args';
import { baseUnitNestedQueryArgs } from '../unit/unit.nested.query-args';
import { userNestedQueryArgs } from '../user/user.nested.query-args';

export const processStepDeepQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchNestedQueryArgs,
    executedBy: baseUnitNestedQueryArgs,
    recordedBy: userNestedQueryArgs,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});
