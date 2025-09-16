/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { batchResultFields } from './batch.result-fields';
import { baseUnitResultFields } from './unit.result-fields';

export const processStepResultFields = Prisma.validator<Prisma.ProcessStepDefaultArgs>()({
  include: {
    batch: batchResultFields,
    executedBy: baseUnitResultFields,
    recordedBy: true,
    documents: true,
    processStepDetails: {
      include: {
        transportationDetails: true,
      },
    },
  },
});
