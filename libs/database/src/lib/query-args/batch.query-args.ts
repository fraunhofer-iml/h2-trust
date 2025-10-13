/*
 * Copyright Fraunhofer Institute for Material Flow and Logistics
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * For details on the licensing terms, see the LICENSE file.
 * SPDX-License-Identifier: Apache-2.0
 */

import { Prisma } from '@prisma/client';
import { companyQueryArgs } from './company.query.args';

export const batchQueryArgs = Prisma.validator<Prisma.BatchDefaultArgs>()({
  include: {
    owner: companyQueryArgs,
    predecessors: {
      include: {
        owner: companyQueryArgs,
        hydrogenStorageUnit: {
          include: {
            generalInfo: true,
          },
        },
        processStep: true,
      },
    },
    successors: {
      include: {
        owner: companyQueryArgs,
        hydrogenStorageUnit: {
          include: {
            generalInfo: true,
          },
        },
        processStep: true,
      },
    },
    hydrogenStorageUnit: {
      include: {
        generalInfo: true,
      },
    },
    processStep: true,
  },
});
