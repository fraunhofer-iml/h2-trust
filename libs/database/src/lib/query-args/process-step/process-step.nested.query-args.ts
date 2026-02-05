/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchFlatQueryArgs } from '../batch/batch.flat.query-args';
import { baseUnitFlatQueryArgs } from '../unit/unit.flat.query-args';
import { userFlatQueryArgs } from '../user/user.flat.query-args';

export const processStepNestedQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchFlatQueryArgs,
    executedBy: baseUnitFlatQueryArgs,
    recordedBy: userFlatQueryArgs,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});
