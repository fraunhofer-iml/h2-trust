/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchQueryArgs } from './batch.query-args';
import { baseUnitQueryArgs } from './unit.query-args';
import { userQueryArgs } from './user.query-args';

export const processStepQueryArgs = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchQueryArgs,
    executedBy: baseUnitQueryArgs,
    recordedBy: userQueryArgs,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});
