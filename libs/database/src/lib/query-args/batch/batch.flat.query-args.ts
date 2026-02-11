/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';

export const batchFlatQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: true,
    predecessors: true,
    successors: true,
    hydrogenStorageUnit: true,
    batchDetails: {
      include: {
        qualityDetails: true
      }
    },
    processStep: true,
  },
});

export const activeBatchFlatQueryArgs = Prisma.validator<Prisma.BatchFindManyArgs>()({
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
